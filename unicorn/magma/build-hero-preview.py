import base64
import json
import mimetypes
import re
from pathlib import Path

folder = Path(__file__).resolve().parent
root = folder.parents[1]
page_dir = root / 'prometheus/r11'
parts = json.loads((folder / 'review/hero-markup.json').read_text())


def inline_asset(url):
    if not url.startswith('../'):
        return url
    asset = (page_dir / url).resolve()
    mime = mimetypes.guess_type(asset)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(asset.read_bytes()).decode()


styles = re.sub(r"@font-face\s*\{[^}]*'Geist Mono'[^}]*\}", '', parts['styles'])
styles = re.sub(r'([\d.]+)(?:s|d)?vh', lambda match: f'{float(match[1]) * 9:g}px', styles)
styles = styles.replace('url(../assets/flame2.png)', 'none')
styles = styles.replace('url(../assets/grain.png)', 'var(--preview-grain)')
styles = ':root{--preview-grain:url(' + inline_asset('../assets/grain.png') + ')}' + styles
styles = re.sub(r'url\([\'\"]?([^\)\'\"]+)[\'\"]?\)', lambda match: f'url({inline_asset(match[1])})', styles)
markup = parts['icons'] + parts['nav'] + '<main>' + parts['hero'] + '</main>'
markup = re.sub(r'src="([^"]+)"', lambda match: f'src="{inline_asset(match[1])}"', markup)
runtime = (root / 'prometheus/assets/unicorn/hero-magma.js').read_text()
html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PPQ · Magma vivo</title><style>'
html += styles + '\nhtml,body{background:transparent}.nav{position:absolute}.hero{margin:0}.rise{animation:none}</style></head><body>'
html += markup + '<script src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.6.0/dist/unicornStudio.umd.js"></script><script>' + runtime + '</script></body></html>'
(folder / 'hero-preview.html').write_text(html)
print(f'Hero preview saved: {len(html.encode())} bytes')
