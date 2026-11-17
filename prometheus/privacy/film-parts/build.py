# Builds privacy/film.html from r11/prometheus.html: swaps only the privacy story (the film), its CSS and its script.
# Usage: python3 privacy/film-parts/build.py [source page] [output page]
import sys, re, os
here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '../../r11/prometheus.html')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, '../film.html')
s = open(src).read()
part = lambda n: open(os.path.join(here, n)).read()
a = s.index('      <div class="en-story story" id="en-story"')
b = s.index('      <details class="en-tech">')
s = s[:a] + part('section.html') + s[b:]
s = s.replace('<link rel="stylesheet" href="story.css">', '<link rel="stylesheet" href="../r11/story.css">\n<style>\n' + part('style.css') + '</style>', 1)
s = s.replace('<script src="story.js"></script>', '<script src="../r11/story.js"></script>', 1)
s = s.replace('<script src="../assets/enclave3d.js"></script>\n', '', 1)
m = re.search(r"  // privacy: the 3D story.*?\n  else document\.querySelector\('\.en-3d'\)\?\.classList\.add\('no-3d'\);\n", s, re.S)
assert m, 'mount block not found'
s = s[:m.start()] + '  // privacy: the film script is below\n' + s[m.end():]
s = s.replace('<script src="../assets/chat-models.js"></script>', '<script>\n' + part('script.js') + '</script>\n<script src="../assets/chat-models.js"></script>', 1)
s = s.replace('<title>', '<title>Film study · ', 1)
open(out, 'w').write(s)
print('wrote', out)
