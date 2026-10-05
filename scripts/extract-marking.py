#!/usr/bin/env python3
"""Extract one pavement-marking / symbol drawing from an official FHWA SHS 2004 sheet (DEC-010, DEC-014).

Usage: extract-marking.py <sheet.pdf> <page> <out.svg> [--paths i,j,...] [--region x y w h] [--keep-white]
Companion to extract-sign.py for sheets that are not framed signs (Pavement.pdf marking stencils,
Standards.pdf pedestrian signal indicators, rotated-text sheets such as the R15-1 crossbuck).
Renders the sheet to SVG with pdftocairo, then removes drawing annotations: stroke-only lines
(dimension/grid lines), small glyph labels, arrowheads and thin dimension pieces, and (unless
--keep-white) the white label boxes. With --paths only the listed filled paths of the sheet are kept
(indices as printed by `--list`); the crop is the box of what is kept (margin 4 pt) unless --region
is given. The artwork is placed on a white background rectangle, as on the official sheet, because
the stencils are black. Every result must be checked visually against the sheet (DEC-014).
"""
import re, subprocess, sys, tempfile, xml.etree.ElementTree as ET

NS = 'http://www.w3.org/2000/svg'
XL = '{http://www.w3.org/1999/xlink}href'
ET.register_namespace('', NS)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
FLIP = 'matrix(1, 0, 0, -1, 0, 792)'
MIN_GLYPH = 12   # glyph labels shorter than this (points) are drawing annotations
MIN_PIECE = 12   # filled pieces whose largest side is below this are arrowheads / ticks


def nums(d):
    return [float(n) for n in re.findall(r'-?\d+\.?\d*', d or '')]


def box(e):
    n = nums(e.get('d'))
    xs, ys = n[0::2], n[1::2]
    if not xs or not ys:
        return None
    if e.get('transform') == FLIP:
        ys = [792 - y for y in ys]
    return (min(xs), min(ys), max(xs), max(ys))


def is_white(v):
    return bool(v) and v.replace(' ', '') in ('rgb(100%,100%,100%)',)


def main():
    argv = sys.argv[1:]
    listing = '--list' in argv
    keep_white = '--keep-white' in argv
    paths = region = None
    if '--paths' in argv:
        paths = {int(i) for i in argv[argv.index('--paths') + 1].split(',')}
    if '--region' in argv:
        k = argv.index('--region')
        region = [float(v) for v in argv[k + 1:k + 5]]
    pos = []
    skip = 0
    for i, a in enumerate(argv):
        if skip:
            skip -= 1
        elif a == '--paths':
            skip = 1
        elif a == '--region':
            skip = 4
        elif not a.startswith('--'):
            pos.append(a)
    pdf, page, out = pos[0], pos[1], pos[2]
    with tempfile.NamedTemporaryFile(suffix='.svg') as tmp:
        subprocess.run(['pdftocairo', '-svg', '-f', page, '-l', page, pdf, tmp.name], check=True, stderr=subprocess.DEVNULL)
        tree = ET.parse(tmp.name)
    root = tree.getroot()
    if listing:
        for i, e in enumerate(p for p in root.iter(f'{{{NS}}}path') if p.get('fill') not in (None, 'none')):
            b = box(e)
            if b and max(b[2] - b[0], b[3] - b[1]) > 20:
                print(i, [round(v) for v in b], e.get('fill')[:24])
        return
    glyph_h = {}
    for g in root.iter(f'{{{NS}}}g'):
        if (g.get('id') or '').startswith('glyph'):
            p = g.find(f'{{{NS}}}path')
            if p is not None:
                n = nums(p.get('d'))
                ys = n[1::2]
                glyph_h[g.get('id')] = (max(ys) - min(ys)) if ys else 0
    idx = -1
    for parent in root.iter():
        for child in list(parent):
            tag = child.tag.split('}')[1]
            fill, stroke = child.get('fill'), child.get('stroke')
            if tag == 'path' and fill not in (None, 'none'):
                idx += 1
                b = box(child)
                drop = paths is not None and idx not in paths
                if not drop and paths is None and b:
                    w, h = b[2] - b[0], b[3] - b[1]
                    drop = max(w, h) < MIN_PIECE or min(w, h) < 1.5 or (is_white(fill) and not keep_white)
                if drop:
                    parent.remove(child)
            elif tag == 'path' and fill == 'none' and stroke:
                parent.remove(child)            # dimension / grid lines
            elif tag == 'use' and (paths is not None or glyph_h.get((child.get(XL) or '')[1:], 0) < MIN_GLYPH):
                parent.remove(child)            # small text labels
    if region is None:
        # only paths that sit directly in the page (not in <defs> glyph groups)
        boxes = [box(e) for e in root.iter(f'{{{NS}}}path') if e.get('fill') not in (None, 'none') and e.get('d') and box(e)]
        m = 4
        region = [min(b[0] for b in boxes) - m, min(b[1] for b in boxes) - m,
                  max(b[2] for b in boxes) - min(b[0] for b in boxes) + 2 * m,
                  max(b[3] for b in boxes) - min(b[1] for b in boxes) + 2 * m]
    x, y, w, h = region
    bg = ET.Element(f'{{{NS}}}rect', {'x': str(x), 'y': str(y), 'width': str(w), 'height': str(h), 'fill': '#ffffff'})
    # insert the background after <defs> so it sits behind the artwork
    kids = list(root)
    pos_i = next((i + 1 for i, c in enumerate(kids) if c.tag.endswith('defs')), 0)
    root.insert(pos_i, bg)
    root.set('viewBox', f'{x} {y} {w} {h}')
    root.set('width', str(w)); root.set('height', str(h))
    tree.write(out, xml_declaration=True, encoding='utf-8')


main()
