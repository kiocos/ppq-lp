# Download latin woff2 files from Google Fonts css2 (OFL families) into assets/fonts
import re, urllib.request, sys, os
OUT = '../assets/fonts'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
fams = {
  'MartianMono': 'Martian+Mono:wdth,wght@75..112.5,100..800',
  'Archivo': 'Archivo:wdth,wght@62..125,100..900',
  'SourceSerif4': 'Source+Serif+4:opsz,wght@8..60,200..900',
  'FunnelDisplay': 'Funnel+Display:wght@300..800',
  'Michroma': 'Michroma',
  'JetBrainsMono': 'JetBrains+Mono:wght@100..800',
  'IBMPlexMono': 'IBM+Plex+Mono:wght@400;500',
  'SchibstedGrotesk': 'Schibsted+Grotesk:wght@400..900',
  'MonaSans': 'Mona+Sans:wdth,wght@75..125,200..900',
  'HubotSans': 'Hubot+Sans:wdth,wght@75..125,200..900',
  'Newsreader': 'Newsreader:opsz,wght@6..72,200..800',
  'InstrumentSans': 'Instrument+Sans:wdth,wght@75..100,400..700',
}
for name, q in fams.items():
    url = f'https://fonts.googleapis.com/css2?family={q}&display=swap'
    css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})).read().decode()
    blocks = re.findall(r'/\*\s*([\w-]+)\s*\*/\s*@font-face\s*{([^}]*)}', css)
    got = 0
    for subset, body in blocks:
        if subset != 'latin': continue
        src = re.search(r'url\((https://[^)]+\.woff2)\)', body).group(1)
        weight = re.search(r'font-weight:\s*([^;]+);', body).group(1).strip().replace(' ', '-')
        style = re.search(r'font-style:\s*(\w+)', body).group(1)
        fn = f'{name}-{weight}-{style}.woff2' if name in ('IBMPlexMono',) else f'{name}-{style}.woff2'
        urllib.request.urlretrieve(src, os.path.join(OUT, fn)); got += 1
    print(name, 'files', got)
