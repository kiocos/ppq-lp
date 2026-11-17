# Every src/poster/href to a local file in the study pages must exist
import re, os, glob, sys
missing = 0
for f in sorted(glob.glob('r*/*.html') + ['index.html', 'logo-study.html']):
    s = open(f).read(); base = os.path.dirname(f)
    for ref in re.findall(r'(?:src|poster|href)="([^"#?]+)"', s):
        if ref.startswith(('http', 'mailto:', 'data:')): continue
        p = os.path.normpath(os.path.join(base, ref))
        if not os.path.exists(p): print('MISSING', f, ref); missing += 1
    for ref in re.findall(r'url\((\.\./[^)]+)\)', s):
        p = os.path.normpath(os.path.join(base, ref))
        if not os.path.exists(p): print('MISSING', f, ref); missing += 1
print('missing:', missing)
