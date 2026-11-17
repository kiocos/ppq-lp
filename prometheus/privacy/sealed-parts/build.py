# Builds privacy/sealed.html from r11/prometheus.html: swaps only the privacy visual, its CSS and its script.
# Usage: python3 privacy/sealed-parts/build.py [source page] [output page]
import sys, re, os
here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '../../r11/prometheus.html')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, '../sealed.html')
s = open(src).read()
part = lambda n: open(os.path.join(here, n)).read()
a = s.index('        <div class="en-pin-wrap story-visual">')
b = s.index('      <details class="en-tech">')
# the visual block ends with three closing divs (frame, pin-wrap) before the layout/story closers
seg = s[a:b]
end = seg.index('            </div>\n          </div>\n        </div>\n') + len('            </div>\n          </div>\n        </div>\n')
s = s[:a] + part('visual.html') + s[a + end:]
s = s.replace('<link rel="stylesheet" href="story.css">', '<link rel="stylesheet" href="../r11/story.css">\n<style>\n' + part('style.css') + '</style>', 1) if '../r11/story.css' not in s else s
s = s.replace('<script src="story.js"></script>', '<script src="../r11/story.js"></script>', 1)
s = s.replace('<script src="../assets/enclave3d.js"></script>\n', '', 1)
old = re.search(r"  // privacy: the 3D story.*?\n  else document\.querySelector\('\.en-3d'\)\?\.classList\.add\('no-3d'\);\n", s, re.S)
assert old, 'mount block not found'
s = s[:old.start()] + '  // privacy: the "sealed" study script is below\n' + s[old.end():]
s = s.replace('<script src="../assets/chat-models.js"></script>', '<script>\n' + part('script.js') + '</script>\n<script src="../assets/chat-models.js"></script>', 1)
# both columns pin together; the copy shows one step at a time
s = s.replace('        <div class="story-layout">\n            <ol class="en-steps story-copy">', '        <div class="story-layout sx-pin">\n          <div class="sx-copy">\n            <ol class="en-steps story-copy">', 1)
s = s.replace('            </ol>\n', '            </ol>\n            <div class="sx-ticks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>\n          </div>\n', 1)
assert 'sx-copy' in s and 'sx-ticks' in s
s = s.replace('<title>', '<title>Sealed study · ', 1)
open(out, 'w').write(s)
print('wrote', out)
