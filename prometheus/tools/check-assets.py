# Every src/poster/href/srcset/url() pointing at a local file in the prometheus pages must exist.
import re, os, glob
missing = 0
pages = sorted(glob.glob('../r*/*.html') + glob.glob('../index.html'))
for f in pages:
    s = open(f).read(); base = os.path.dirname(f)
    refs = re.findall(r'(?:src|poster|href)="([^"#?]+)"', s) + [u.split(' ')[0] for v in re.findall(r'srcset="([^"]+)"', s) for u in v.split(', ')] + re.findall(r'url\((\.\./[^)]+)\)', s)
    for ref in refs:
        if ref.startswith(('http', 'mailto:', 'data:')): continue
        p = os.path.normpath(os.path.join(base, ref.split(' ')[0]))
        if not os.path.exists(p): print('MISSING', f, ref); missing += 1
print('pages', len(pages), 'missing:', missing)
