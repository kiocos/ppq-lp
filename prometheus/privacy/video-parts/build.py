# Builds the privacy film player into R11 or a separate study page
# Usage: python3 privacy/video-parts/build.py [source page] [output page]
import sys, re, os
here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '../../r11/prometheus.html')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, '../video.html')
s = open(src).read()
part = lambda n: open(os.path.join(here, n)).read()
a = s.index('      <!-- the privacy film:') if 'id="vp"' in s else s.index('      <div class="en-story story" id="en-story"')
b = s.index('      <details class="en-tech">')
s = s[:a] + part('section.html') + s[b:]
style = '<style id="enclave-video-style">\n' + part('style.css') + '</style>'
if '<style id="enclave-video-style">' in s:
    s = re.sub(r'<style id="enclave-video-style">.*?</style>', lambda _: style, s, count=1, flags=re.S)
else:
    s, count = re.subn(r'<link rel="stylesheet" href="[^"]*story\.css">', lambda m: m[0] + '\n' + style, s, count=1)
    assert count, 'story stylesheet not found'

# Keep the story assets relative to their original location when building the study
def story_path(m):
    path = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(src)), m[2]))
    return m[1] + os.path.relpath(path, os.path.dirname(os.path.abspath(out))) + m[3]
s = re.sub(r'((?:href|src)=")([^"]*story\.(?:css|js))(")', story_path, s)
s = s.replace('<script src="../assets/enclave3d.js"></script>\n', '', 1)
m = re.search(r"  // privacy: the 3D story.*?\n  else document\.querySelector\('\.en-3d'\)\?\.classList\.add\('no-3d'\);\n", s, re.S)
if m:
    s = s[:m.start()] + '  // privacy: the film player script is below\n' + s[m.end():]
script = '<script id="enclave-video-script">\n' + part('script.js') + '</script>'
if '<script id="enclave-video-script">' in s:
    s = re.sub(r'<script id="enclave-video-script">.*?</script>', lambda _: script, s, count=1, flags=re.S)
else:
    anchor = '<script src="../assets/chat-models.js"></script>'
    assert anchor in s, 'chat models script not found'
    s = s.replace(anchor, script + '\n' + anchor, 1)
s = s.replace('<title>Video study · ', '<title>', 1)
if os.path.basename(out) == 'video.html':
    s = s.replace('<title>', '<title>Video study · ', 1)
open(out, 'w').write(s)
print('wrote', out)
