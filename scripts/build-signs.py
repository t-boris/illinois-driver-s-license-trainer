#!/usr/bin/env python3
"""Build sign library assets from verified needed-signs lists (DEC-010, DEC-014).

Usage: build-signs.py <needed-signs.json> [...]  (each: {"signs":[{"designation","file","page","title"}]})
Downloads the official FHWA SHS 2004 PDFs (cached in $SHS_CACHE or ./.shs-cache), extracts each sign
with extract-sign.py into signs/<designation>.svg and writes signs/<designation>.json with the
source publication, URL, sheet page and retrieval date. Alt text is left neutral (shape/colour is
added by hand) and `visualCheck` is left empty until someone has compared the result with the sheet.
"""
import json, os, subprocess, sys, datetime, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.environ.get('SHS_CACHE', os.path.join(ROOT, '.shs-cache'))
BASE = 'https://mutcd.fhwa.dot.gov/SHSe/'
TITLES = {'Regulatory.pdf': 'Regulatory Signs', 'Warning.pdf': 'Warning Signs', 'Guide.pdf': 'Guide Signs',
          'School.pdf': 'School Signs', 'EM.pdf': 'Emergency Management and Civil Defense Signs'}

def fetch(name):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        subprocess.run(['curl', '-sL', '-A', 'Mozilla/5.0', '-o', path, BASE + name], check=True)
    return path

def main():
    today = datetime.date.today().isoformat()
    for lst in sys.argv[1:]:
        for s in json.load(open(lst))['signs']:
            d, f, pg = s['designation'], s['file'], int(s['page'])
            if not re.fullmatch(r'[A-Za-z0-9.-]+', d):
                raise SystemExit(f'bad designation {d}')
            out = os.path.join(ROOT, 'signs', f'{d}.svg')
            if os.path.exists(os.path.join(ROOT, 'signs', f'{d}.json')):
                continue  # already in the library
            pdf = fetch(f)
            subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'extract-sign.py'), pdf, str(pg), out], check=True)
            meta = {
                'id': d, 'designation': d,
                'source': {'publication': f"FHWA Standard Highway Signs (SHS), 2004 Edition, {TITLES.get(f, f)}, sheet {s.get('title', d)}",
                           'url': BASE + f, 'page': pg, 'retrieved': today},
                'extraction': f'scripts/extract-sign.py {f} {pg} signs/{d}.svg (auto-crop)',
                'visualCheck': None,
                'file': f'{d}.svg',
                'alt': {'ru': f'Дорожный знак {d}', 'en': f'Road sign {d}'},
            }
            json.dump(meta, open(os.path.join(ROOT, 'signs', f'{d}.json'), 'w'), ensure_ascii=False, indent=2)
            print('built', d)

main()
