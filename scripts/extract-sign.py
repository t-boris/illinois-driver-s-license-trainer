#!/usr/bin/env python3
"""Extract one clean sign from an official FHWA SHS drawing sheet (DEC-014).

Usage: extract-sign.py <sheet.pdf> <page> <out.svg> [x y w h]
Renders the sheet to SVG with pdftocairo and removes drawing annotations (stroke-only
lines, small glyph labels, arrowheads, thin dimension lines) while keeping the official
sign artwork, including black legends. The output is cropped automatically to the sign
(margin 4pt) unless x y w h (PDF points) are given. Every result must be checked
visually against the source sheet (DEC-014).
Options: --keep-text keeps small legend glyphs that lie inside the sign face (needed for signs with
small lettering such as ROAD WORK AHEAD); check the result for stray dimension labels.
"""
import re, subprocess, sys, tempfile, xml.etree.ElementTree as ET

NS = 'http://www.w3.org/2000/svg'
FACE_HULL = []
ET.register_namespace('', NS)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')

def is_black(v):
    m = re.match(r'rgb\(([\d.]+)%, ([\d.]+)%, ([\d.]+)%\)', v or '')
    return bool(m) and all(float(g) < 20 for g in m.groups())

def extent(d):
    nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', d or '')]
    xs, ys = nums[0::2], nums[1::2]
    return (max(xs) - min(xs), max(ys) - min(ys)) if xs and ys else (0, 0)

MIN_KEEP_TEXT = 14  # with --keep-text, glyphs at least this tall inside the face are legend; smaller ones are dimension labels
MIN_LEGEND = 40  # glyphs/paths smaller than this (PDF points) are labels and arrowheads, not sign artwork

def path_box(e):
    d = e.get('d')
    nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', d or '')]
    xs, ys = nums[0::2], nums[1::2]
    if not xs or not ys:
        return None
    if e.get('transform') == 'matrix(1, 0, 0, -1, 0, 792)':
        ys = [792 - y for y in ys]
    return (min(xs), min(ys), max(xs), max(ys))

def hull(points):
    pts = sorted(set(points))
    if len(pts) < 3:
        return pts
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]

def inside(poly, pt):
    x, y = pt
    sign = 0
    for i in range(len(poly)):
        a, b = poly[i], poly[(i + 1) % len(poly)]
        c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
        if c != 0:
            if sign and (c > 0) != (sign > 0):
                return False
            sign = 1 if c > 0 else -1
    return True

def face_points(e):
    nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', e.get('d') or '')]
    xs, ys = nums[0::2], nums[1::2]
    if e.get('transform') == 'matrix(1, 0, 0, -1, 0, 792)':
        ys = [792 - y for y in ys]
    return list(zip(xs, ys))

def bbox_of(root):
    """Bounding box (PDF points, y down) of the sign face: the filled shape with the largest box."""
    best, best_area = None, 0
    global FACE_HULL
    for e in root.iter(f'{{{NS}}}path'):
        d = e.get('d')
        if not d or e.get('fill') in (None, 'none'):
            continue
        nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', d)]
        xs, ys = nums[0::2], nums[1::2]
        if not xs or not ys:
            continue
        if e.get('transform') == 'matrix(1, 0, 0, -1, 0, 792)':
            ys = [792 - y for y in ys]
        box = (min(xs), min(ys), max(xs), max(ys))
        area = (box[2] - box[0]) * (box[3] - box[1])
        if area > best_area:
            best, best_area = box, area
            FACE_HULL = hull(face_points(e))
    return best

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--keep-')]
    strip_black = '--strip-black' in sys.argv
    keep_text = '--keep-text' in sys.argv
    pdf, page, out = args[0], args[1], args[2]
    crop = [float(v) for v in args[3:7]] if len(args) >= 7 else None
    with tempfile.NamedTemporaryFile(suffix='.svg') as tmp:
        subprocess.run(['pdftocairo', '-svg', '-f', page, '-l', page, pdf, tmp.name], check=True)
        tree = ET.parse(tmp.name)
    root = tree.getroot()
    global FACE_HULL
    if not crop:
        bbox_of(root)  # sets FACE_HULL from the largest filled shape
    else:
        cx, cy, cw, ch = crop
        FACE_HULL = [(cx, cy), (cx + cw, cy), (cx + cw, cy + ch), (cx, cy + ch)]
    glyph_h = {}
    for g in root.iter(f'{{{NS}}}g'):
        if (g.get('id') or '').startswith('glyph'):
            p = g.find(f'{{{NS}}}path')
            if p is not None:
                glyph_h[g.get('id')] = extent(p.get('d'))[1]
    for parent in root.iter():
        for child in list(parent):
            fill, stroke = child.get('fill'), child.get('stroke')
            tag = child.tag.split('}')[1]
            annotation = (
                (strip_black and (is_black(fill) or is_black(stroke)))  # optional: drop black artwork too
                or (tag == 'path' and fill == 'none' and stroke)           # any stroke-only line is a drawing aid
                or (tag == 'use' and glyph_h.get((child.get('{http://www.w3.org/1999/xlink}href') or '')[1:], 0) < MIN_LEGEND
                    and not (keep_text and len(FACE_HULL) > 2 and inside(FACE_HULL, (float(child.get('x') or 0), float(child.get('y') or 0)))
                             and glyph_h.get((child.get('{http://www.w3.org/1999/xlink}href') or '')[1:], 0) >= MIN_KEEP_TEXT))  # small glyph labels (F*, (c), ...)
                or (tag == 'path' and fill and fill != 'none' and not child.get('transform')
                    and (max(extent(child.get('d'))) < MIN_LEGEND or min(extent(child.get('d'))) < 2))  # arrowheads, thin dimension lines
            )
            if annotation:
                parent.remove(child)
    auto = not crop
    if not crop:
        b = bbox_of(root)
        if b:
            m = 4
            crop = [b[0] - m, b[1] - m, b[2] - b[0] + 2 * m, b[3] - b[1] + 2 * m]
    if auto and crop:
        # drop stray drawing pieces (e.g. reduced-size copies) that are not fully inside the sign face
        x, y, w, h = crop; m = 4; tol = 1.5
        face = (x + m - tol, y + m - tol, x + w - m + tol, y + h - m + tol)
        for parent in root.iter():
            for child in list(parent):
                if child.tag.split('}')[1] == 'path' and child.get('fill') not in (None, 'none'):
                    b = path_box(child)
                    if b and (b[0] < face[0] or b[1] < face[1] or b[2] > face[2] or b[3] > face[3]):
                        parent.remove(child)
                    elif b and len(FACE_HULL) > 2 and not inside(FACE_HULL, ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)):
                        parent.remove(child)  # lies in the corner of the box but outside the sign outline
    if crop:
        x, y, w, h = crop
        root.set('viewBox', f'{x} {y} {w} {h}')
        root.set('width', str(w)); root.set('height', str(h))
    tree.write(out, xml_declaration=True, encoding='utf-8')

main()
