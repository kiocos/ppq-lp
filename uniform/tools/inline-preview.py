# Build compact, self-contained previews of the round-3 pages for the inline renderer
import re, json, os, sys
ROOT = '/Users/kio/ppq/landing-page/uniform'
FONTS = {
  '01': 'family=Geist:wght@400..700&family=Geist+Mono:wght@400..600',
  '02': 'family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&family=Archivo:wdth,wght@125,500..800',
  '03': 'family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&family=Source+Serif+4:opsz,wght@8..60,500..700',
  '04': 'family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&family=Martian+Mono:wdth,wght@87.5,400..700',
  '05': 'family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&family=Funnel+Display:wght@500..800',
}
kit = open(f'{ROOT}/assets/kit.css').read() + open(f'{ROOT}/assets/kit-r2.css').read() + open(f'{ROOT}/assets/kit-r3.css').read()
kit = re.sub(r'@font-face\s*{[^}]*}', '', kit)
kit = re.sub(r'/\*.*?\*/', '', kit, flags=re.S)
kit = re.sub(r'\.pair[\w-]*[^{]*{[^}]*}', '', kit)
kit = kit.replace('body { margin: 0;', '.pg { margin: 0;').replace('html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }', '')

def strip_media(css):
    # drop @media (max-width…) blocks so the desktop layout renders inside the scaled frame
    out, i = [], 0
    for m in re.finditer(r'@media\s*\(max-width[^{]*{', css):
        pass
    while True:
        m = re.search(r'@media\s*\((?:max-width|prefers-reduced-motion)[^{]*{', css[i:])
        if not m: out.append(css[i:]); break
        start = i + m.start(); out.append(css[i:start])
        depth, j = 0, i + m.end() - 1
        while j < len(css):
            if css[j] == '{': depth += 1
            elif css[j] == '}':
                depth -= 1
                if depth == 0: break
            j += 1
        i = j + 1
    return ''.join(out)

def absp(base, ref):
    return os.path.normpath(os.path.join(base, ref))

for f in sorted(os.listdir(f'{ROOT}/r3')):
    k = f[:2]; base = f'{ROOT}/r3'
    s = open(f'{base}/{f}').read()
    page_css = re.search(r'<style>(.*?)</style>', s, re.S).group(1)
    pairing = json.loads(re.search(r"data-pairings='(.*?)'", s, re.S).group(1))[0]['vars']
    body = re.search(r'<body[^>]*>(.*?)<script src="../assets/kit.js"></script>', s, re.S).group(1)
    body = re.sub(r'<script>.*?</script>', '', body, flags=re.S)
    body = re.sub(r'<a class="skip"[^>]*>.*?</a>', '', body)
    # videos -> poster images (desktop twins only; phone twins are dropped)
    body = re.sub(r'<div class="[^"]*m-only[^"]*"[^>]*>\s*<video.*?</video>\s*</div>', '', body, flags=re.S)
    body = re.sub(r'<div class="code m-only".*?</code></div>', '', body, flags=re.S)
    def vid(m):
        poster = re.search(r'poster="([^"]+)"', m.group(0)).group(1)
        return f'<img src="{absp(base, poster)}" alt="" style="width:100%;height:100%;object-fit:cover">'
    body = re.sub(r'<video.*?</video>', vid, body, flags=re.S)
    body = re.sub(r'src="(\.\./[^"]+)"', lambda m: f'src="{absp(base, m.group(1))}"', body)
    body = re.sub(r'\s(?:aria-label|aria-describedby|aria-hidden|data-inview|role|aria-controls|aria-selected|aria-labelledby|tabindex)="[^"]*"', '', body)
    body = re.sub(r'<div class="vh">.*?</table></div>', '', body, flags=re.S)
    # sats table on page 03 is filled by script on the live page
    body = re.sub(r'data-usd="([\d.]+)"></td>', lambda m: f'>${float(m.group(1)):.4f}</td>', body)
    codes = re.findall(r'<code>.*?</code>', body, flags=re.S)
    for n, c in enumerate(codes): body = body.replace(c, f'@@CODE{n}@@', 1)
    body = re.sub(r'\s+', ' ', body)
    for n, c in enumerate(codes): body = body.replace(f'@@CODE{n}@@', c.replace('\n', '&#10;'), 1)
    pass  # keep single spaces between tags: two-tone phrases need them
    css = strip_media(kit) + strip_media(re.sub(r'/\*.*?\*/', '', page_css, flags=re.S))
    css = css.replace('width: min(100vw - 32px, 1600px)', 'width: 1248px')
    css = re.sub(r'url\((\.\./assets/[^)]+)\)', 'none', css)
    css += ':root{' + ';'.join(f'{a}:{b}' for a, b in pairing.items()) + '}'
    css += '.rise{animation:none!important}.nav{position:relative!important}.copy{display:none}'
    css += '.pp{padding:16px;border-radius:var(--radius);background:var(--bg);overflow:hidden}.pg{width:1280px;transform-origin:0 0;background:var(--bg);color:var(--fg)}'
    css = re.sub(r'\s+', ' ', css); css = re.sub(r'\s*([{};:,>])\s*', r'\1', css)
    script = "<script>const p=document.querySelector('.pp'),g=document.querySelector('.pg');function z(){const s=(p.clientWidth-32)/1280;g.style.zoom=s}z();addEventListener('resize',z)</script>"
    html = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?{FONTS[k]}&display=swap"><style>{css}</style></head><body><div class="out"><div class="pp"><div class="pg">{body}</div></div></div>{script}</body></html>'
    out = f'/tmp/ppq-preview/{f}'
    open(out, 'w').write(html)
    print(out, len(html))
