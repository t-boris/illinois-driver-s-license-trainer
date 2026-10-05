#!/usr/bin/env python3
"""Extract one pavement-marking / symbol drawing from an official FHWA SHS 2004 sheet (DEC-010, DEC-014).

Usage: extract-marking.py <sheet.pdf> <page> <out.svg> [--paths i,j,...] [--region x y w h] [--keep-white] [--no-bg] [--keep-glyphs]
       extract-marking.py <figure.pdf> <page> <out.svg> --figure --region x y w h
The second form is for colour figures of the FHWA 2009 MUTCD (signal faces, marking diagrams): nothing is
removed except text labels and every element lying outside the region; the artwork keeps its own colours.
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
KEEP_GLYPHS = '--keep-glyphs' in sys.argv  # for tiny regions whose only text is a symbol glyph (arrows)
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


def is_dark(v):
    m = re.match(r'rgb\(([\d.]+)%, ([\d.]+)%, ([\d.]+)%\)', v or '')
    return bool(m) and all(float(g) < 20 for g in m.groups())


def is_white(v):
    return bool(v) and v.replace(' ', '') in ('rgb(100%,100%,100%)',)


def figure_crop(root, region, glyph_h):
    x, y, w, h = region
    for parent in list(root.iter()):
        for child in list(parent):
            if not KEEP_GLYPHS and child.tag.endswith('}g') and (child.get('id') or '').startswith('glyph'):
                parent.remove(child)    # unused text outlines
    def outside(b):
        return b[2] < x or b[0] > x + w or b[3] < y or b[1] > y + h
    for parent in root.iter():
        if parent.tag.endswith('defs') or parent.tag.endswith('clipPath'):
            continue
        for child in list(parent):
            tag = child.tag.split('}')[1]
            if tag == 'use' and (not KEEP_GLYPHS or outside((float(child.get('x', 0)), float(child.get('y', 0))) * 2)):
                parent.remove(child)    # text labels (with --keep-glyphs only those whose origin is outside the region)
            elif tag == 'path' and child.get('d') and child.get('fill') not in (None, 'none'):
                b = box(child)
                if b and (outside(b) or (max(b[2] - b[0], b[3] - b[1]) < 10 and not child.get('transform') and is_dark(child.get('fill')))):
                    parent.remove(child)   # outside the region, or a small dark text mark such as a footnote asterisk
    used = ''.join(ET.tostring(e, encoding='unicode') for e in root.iter() if not e.tag.endswith(('clipPath', 'defs')) and e.tag.split('}')[1] != 'g' or e.get('clip-path'))
    for parent in list(root.iter()):                    # drop clip paths and glyph outlines nothing refers to any more
        for child in list(parent):
            cid = child.get('id') or ''
            if (child.tag.endswith('clipPath') or cid.startswith('glyph')) and f'#{cid}' not in used and f'({cid})' not in used:
                parent.remove(child)
    for parent in list(root.iter()):                     # stroked lines carry their own matrix transform
        for child in list(parent):
            if child.tag.endswith('}path') and child.get('fill') == 'none' and child.get('stroke') and child.get('transform'):
                b = tbox(child)
                if b and outside(b):
                    parent.remove(child)
    prune = True
    while prune:                         # drop groups emptied by the removals above
        prune = False
        for parent in list(root.iter()):
            for child in list(parent):
                if child.tag.endswith('}g') and len(child) == 0 and not child.attrib.get('id'):
                    parent.remove(child); prune = True


def tbox(e):
    """Bounding box of a path in page space, applying its own matrix(a,b,c,d,e,f) transform if it has one."""
    n = nums(e.get('d'))
    pts = list(zip(n[0::2], n[1::2]))
    m = re.match(r'matrix\(([^)]*)\)', e.get('transform') or '')
    if m:
        a, b, c, d, tx, ty = [float(v) for v in m.group(1).split(',')]
        pts = [(a * px + c * py + tx, b * px + d * py + ty) for px, py in pts]
    if not pts:
        return None
    w = float(e.get('stroke-width') or 0)
    return (min(p[0] for p in pts) - w, min(p[1] for p in pts) - w, max(p[0] for p in pts) + w, max(p[1] for p in pts) + w)


def main():
    argv = sys.argv[1:]
    listing = '--list' in argv
    keep_white = '--keep-white' in argv
    no_bg = '--no-bg' in argv
    figure = '--figure' in argv
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
    if figure:
        figure_crop(root, region, glyph_h)
        x, y, w, h = region
        root.set('viewBox', f'{x} {y} {w} {h}')
        root.set('width', str(w)); root.set('height', str(h))
        tree.write(out, xml_declaration=True, encoding='utf-8')
        return
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
    if no_bg:
        root.set('viewBox', f'{x} {y} {w} {h}')
        root.set('width', str(w)); root.set('height', str(h))
        tree.write(out, xml_declaration=True, encoding='utf-8')
        return
    bg = ET.Element(f'{{{NS}}}rect', {'x': str(x), 'y': str(y), 'width': str(w), 'height': str(h), 'fill': '#ffffff'})
    # insert the background after <defs> so it sits behind the artwork
    kids = list(root)
    pos_i = next((i + 1 for i, c in enumerate(kids) if c.tag.endswith('defs')), 0)
    root.insert(pos_i, bg)
    root.set('viewBox', f'{x} {y} {w} {h}')
    root.set('width', str(w)); root.set('height', str(h))
    tree.write(out, xml_declaration=True, encoding='utf-8')


main()
