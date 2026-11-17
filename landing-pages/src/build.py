from pathlib import Path
import base64
import html
import json


ROOT = Path(__file__).resolve().parent.parent
COPY = json.loads((ROOT / 'src/copy.json').read_text())
VARIANTS = [
    dict(id='01', slug='studio', name='Studio', hero='wide', enclave='split', privacy='rows', models='reverse', usage='columns', api='stage', wallet='split', closing='split', note='Clareza do Jitter, adaptada ao carvão da PPQ. Hero ampla, capítulos arejados e API como maior demonstração.', inspiration='Jitter · Framer', best='Equilíbrio entre produto, confiança e conversão'),
    dict(id='02', slug='workspace', name='Workspace', hero='split', enclave='reverse', privacy='columns', models='split', usage='ledger', api='split', wallet='band', closing='center', note='A interface ocupa 62% da hero. Alternância entre texto e produto, com a API sempre ao alcance.', inspiration='Framer · PPQ Chat', best='Entrada direta no produto'),
    dict(id='03', slug='panorama', name='Panorama', hero='panorama', enclave='editorial', privacy='matrix', models='stage', usage='columns', api='panorama', wallet='split', closing='large', note='Escala visual do Luma. Títulos amplos, composições assimétricas e grandes superfícies para gravações reais.', inspiration='Luma · Jitter', best='Direção de arte com gravações de alta qualidade'),
    dict(id='04', slug='editorial', name='Editorial', hero='diptych', enclave='reading', privacy='rows', models='editorial', usage='ledger', api='editorial', wallet='band', closing='split', note='Duas cenas de produto em alturas diferentes. Texto e mídia criam um ritmo editorial, sem repetição de cartões.', inspiration='Luma · Jitter', best='Equilíbrio entre narrativa e personalidade'),
    dict(id='05', slug='chapters', name='Chapters', hero='chapters', enclave='split', privacy='matrix', models='reverse', usage='stack', api='stage', wallet='split', closing='center', note='Título amplo, introdução ao lado do produto e navegação lateral entre capítulos. Proteção, escolha e API formam uma leitura contínua.', inspiration='Jitter · leitura editorial', best='Explicar a arquitetura sem perder a orientação'),
    dict(id='06', slug='two-ways', name='Two ways', hero='dual', enclave='editorial', privacy='columns', models='split', usage='columns', api='panorama', wallet='band', closing='split', note='Chat e API aparecem juntos desde o início. O terminal recebe mais espaço, acompanhando a importância comercial da API.', inspiration='Framer · PPQ Chat', best='Mostrar os dois usos da mesma plataforma'),
    dict(id='07', slug='developer', name='Developer', hero='terminal', enclave='reverse', privacy='matrix', models='editorial', usage='ledger', api='split', wallet='split', closing='large', note='Entrada pelo OpenCode, tipografia técnica apenas na interface e uma seção de API com passos de conexão legíveis.', inspiration='Framer · OpenCode', best='Aquisição de usuários de API'),
    dict(id='08', slug='reading-room', name='Reading room', hero='reading', enclave='reading', privacy='rows', models='stage', usage='stack', api='stage', wallet='band', closing='center', note='Uma coluna de leitura concentrada é interrompida por demonstrações amplas. Poucos elementos e bastante atenção à copy.', inspiration='Jitter · editorial', best='Confiança, leitura e compreensão'),
    dict(id='09', slug='focus', name='Focus', hero='compact', enclave='split', privacy='matrix', models='split', usage='ledger', api='editorial', wallet='band', closing='split', note='Composição mais compacta, navegação direta e demonstrações alinhadas ao texto. Laranja reservado para ações e estados.', inspiration='PPQ Chat · Framer', best='Uma evolução próxima do produto atual'),
    dict(id='10', slug='atelier', name='Atelier', hero='portrait', enclave='editorial', privacy='columns', models='reverse', usage='columns', api='panorama', wallet='split', closing='large', note='Palco vertical de produto, espaços assimétricos e áreas generosas para arte própria e movimento complementar.', inspiration='Luma · Framer', best='Uma identidade visual mais autoral'),
]


def esc(value):
    return html.escape(value, quote=True)


def copy(key, tag='p', cls=''):
    return f'<{tag} class="{cls}" data-copy="{key}">{esc(COPY[key])}</{tag}>'


def link(text, url, cls='text-link'):
    return f'<a class="{cls}" href="{url}">{text}<span aria-hidden="true">↗</span></a>'


def actions(api_first=False):
    if api_first:
        return '<div class="actions">' + link('Explore API connections', 'https://ppq.ai/api-docs', 'button primary') + link('Start chatting', 'https://ppq.ai/chat', 'button secondary') + '</div>'
    return '<div class="actions">' + link('Start chatting', 'https://ppq.ai/chat', 'button primary') + link('Explore API connections', 'https://ppq.ai/api-docs', 'button secondary') + '</div>'


def brand():
    return '<span class="brand-flame" aria-hidden="true"></span><span class="brand-word">PayPerQ</span>'


def picker():
    return '''<details class="model-picker"><summary><span class="selected-model">Claude</span><span aria-hidden="true">⌄</span></summary><div class="model-menu"><span class="menu-label">Model selection study</span><button type="button" data-model="Claude" aria-pressed="true">Claude<span>Selected</span></button><button type="button" data-model="GPT" aria-pressed="false">GPT<span>Select</span></button><button type="button" data-model="Open-weight model" aria-pressed="false">Open-weight model<span>Select</span></button></div></details>'''


def chat_scene():
    return f'''<div class="chat-scene product-scene" data-demo-scene="chat"><aside class="chat-sidebar"><b>PPQ</b><span class="sidebar-active">Chat</span><span>API</span><div class="sidebar-bottom"><span>Balance</span><span>Settings</span></div></aside><div class="chat-workspace"><div class="chat-welcome"><h3>What’s on your mind?</h3><p>Start with a question or an idea.</p></div><div class="composer"><div class="composer-placeholder"><span class="demo-draft" data-idle="Ask anything…">Ask anything…</span></div><div class="composer-controls">{picker()}<span class="send-icon" aria-hidden="true">↑</span></div></div><span class="ui-disclosure">Animated interface study · no requests are sent</span></div></div>'''


def terminal_scene():
    return f'''<div class="terminal-scene product-scene" data-demo-scene="api"><div class="terminal-top"><span>opencode</span><span>~/your-project</span></div><div class="terminal-welcome"><span class="terminal-word">open<span>code</span></span><p>Your project. Your choice of model.</p></div><div class="terminal-input"><span class="terminal-prompt" aria-hidden="true">›</span><span class="demo-draft" data-idle="Ask about your code…">Ask about your code…</span></div><div class="terminal-bottom"><span class="provider-name">PPQ</span>{picker()}<span class="terminal-hint">/models</span></div><span class="ui-disclosure">Animated interface study · no requests are sent</span></div>'''


def motion_controls():
    return '''<div class="motion-controls"><button type="button" class="motion-toggle" data-motion-toggle>Pause demo</button><button type="button" class="motion-replay" data-motion-replay aria-label="Replay demo">↺</button><span class="motion-status">Choose a model</span><input class="motion-seek" type="range" min="0" max="16000" step="100" value="0" aria-label="Demo progress"></div>'''


def motion_cursor():
    return '''<span class="motion-cursor" aria-hidden="true"><svg width="20" height="24" viewBox="0 0 20 24" fill="none"><path d="M2 2L18 13L11 14.5L8 22L2 2Z" fill="#ededed" stroke="#151515" stroke-width="1.5" stroke-linejoin="round"/></svg></span>'''


def proof_scene():
    return '''<div class="proof-scene product-scene"><div class="document-top"><span>PPQ / Enclave router</span><span>Verification</span></div><div class="proof-title">Built to be<br>checked.</div><div class="proof-lines"><div><span>Source</span><strong>Published code</strong></div><div><span>Build</span><strong>Reproducible</strong></div><div><span>Check</span><strong>Independent tools</strong></div></div></div>'''


def balance_scene():
    return '''<div class="balance-scene product-scene"><div class="document-top"><span>PPQ / Balance</span><span>Prepaid</span></div><div class="balance-title">One balance.<br>Chat & API.</div><div class="balance-lines"><div><span>Chat requests</span><span>Usage</span></div><div><span>Connected apps</span><span>Usage</span></div><div><span>Monthly PPQ subscription</span><span>None</span></div></div><span class="ui-disclosure">Reserve for the real balance & usage interface</span></div>'''


def media(kind, slot, uid, tabs=False):
    labels = {
        'api': ('PPQ in OpenCode', 'Gravação real: abrir o OpenCode, escolher PPQ e selecionar um modelo. Mostrar uma tarefa curta, sem acelerar a ponto de perder a leitura.'),
        'chat': ('PPQ chat', 'Gravação real: abrir o seletor, trocar de modelo e enviar uma pergunta curta. Usar a interface atual do chat.'),
        'proof': ('Enclave verification', 'Captura real: código publicado e ferramenta de verificação. A legenda deve explicar o que foi verificado.'),
        'balance': ('One prepaid balance', 'Captura real: saldo e histórico de uso de chat e API. Usar uma conta de demonstração sem dados pessoais.'),
    }
    label, note = labels[kind]
    if tabs:
        content = f'''<div class="demo-tabs" role="tablist" aria-label="Product preview"><button id="{uid}-api-tab" type="button" role="tab" aria-selected="true" aria-controls="{uid}-api-panel" tabindex="0" data-demo="api">API · OpenCode</button><button id="{uid}-chat-tab" type="button" role="tab" aria-selected="false" aria-controls="{uid}-chat-panel" tabindex="-1" data-demo="chat">PPQ chat</button><span>Layout study</span></div><div id="{uid}-api-panel" class="demo-panel" role="tabpanel" aria-labelledby="{uid}-api-tab" data-panel="api" tabindex="0">{terminal_scene()}</div><div id="{uid}-chat-panel" class="demo-panel" role="tabpanel" aria-labelledby="{uid}-chat-tab" data-panel="chat" tabindex="0" hidden>{chat_scene()}</div>'''
    else:
        scene = {'api': terminal_scene, 'chat': chat_scene, 'proof': proof_scene, 'balance': balance_scene}[kind]()
        content = f'<div class="media-label"><span>{label}</span><span>Layout study</span></div>{scene}'
    animated = kind in ['api', 'chat']
    independent = animated and not slot.startswith('hero-')
    motion_attr = f' data-motion-demo="{kind}"' if independent else ''
    cursor = motion_cursor() if animated else ''
    controls = motion_controls() if independent else ''
    return f'''<figure class="media media-{kind}" data-asset-slot="{slot}"{motion_attr}><div class="media-frame">{content}{cursor}</div>{controls}<figcaption><span class="asset-label">Product recording space</span><span class="production-note" lang="pt-BR">{note}</span></figcaption></figure>'''


def section_start(uid, name, cls):
    return f'<section id="{uid}-{name}" class="section section-{name} {cls}" aria-labelledby="{uid}-{name}-title">'


def title(uid, name, key):
    return f'<h2 id="{uid}-{name}-title" data-copy="{key}">{esc(COPY[key])}</h2>'


def page(v):
    uid = 'v' + v['id']
    hero = v['hero']
    nav = f'''<a class="brand" href="https://ppq.ai/chat" aria-label="PayPerQ chat">{brand()}</a><nav class="main-nav" aria-label="Main navigation"><a href="#{uid}-enclave">Privacy</a><a href="https://ppq.ai/pricing">Models & pricing</a><a href="#{uid}-api">API</a></nav><a class="nav-cta" href="https://ppq.ai/chat">Open chat <span aria-hidden="true">↗</span></a>'''
    header = f'<a class="skip-link" href="#{uid}-main">Skip to content</a><header class="site-header wrap">{nav}</header>'
    hero_copy = f'<div class="hero-copy">{copy("hero_h", "h1")}{copy("hero_p", "p", "hero-description")}{actions(api_first=v["id"] == "07")}</div>'
    hero_primary = media('api', 'hero-api-recording', uid + '-hero', tabs=hero not in ['dual', 'diptych', 'terminal'])
    if hero in ['diptych', 'dual']:
        hero_media = f'<div class="hero-demos">{hero_primary}{media("chat", "hero-chat-recording", uid + "-hero-chat")}</div>'
    else:
        hero_media = hero_primary
    hero_hint = '<div class="art-reserve" aria-hidden="true"><span lang="pt-BR">Área opcional para um efeito discreto do Unicorn, atrás da mídia</span></div>'
    hero_html = f'<section class="hero hero-{hero} wrap" aria-label="Introduction">{hero_copy}<div class="hero-stage" data-motion-demo="hero">{hero_hint}{hero_media}{motion_controls()}</div></section>'

    enclave = section_start(uid, 'enclave', 'enclave-' + v['enclave'])
    enclave += f'<div class="section-copy">{title(uid, "enclave", "enclave_h")}{copy("enclave_p1")}{copy("enclave_p2")}<div class="proof-copy">{copy("proof_h", "h3")}{copy("proof_p")}{link("See how the enclave works", "https://ppq.ai/blog/introducing-the-enclave-router")}</div>{copy("enclave_note", "p", "scope-note")}</div>'
    enclave += media('proof', 'enclave-verification', uid + '-proof') + '</section>'

    privacy = section_start(uid, 'privacy', 'privacy-' + v['privacy'])
    privacy += f'<div class="section-intro">{title(uid, "privacy", "privacy_h")}{copy("privacy_p")}</div><div class="privacy-options">'
    for key in ['anon', 'zdr', 'e2ee']:
        privacy += f'<div class="privacy-option">{copy(key + "_h", "h3")}{copy(key + "_p")}</div>'
    privacy += f'</div><div class="privacy-foot">{link("Compare privacy protections", "https://ppq.ai/privacy")}{copy("privacy_note", "p", "scope-note")}</div></section>'

    models = section_start(uid, 'models', 'models-' + v['models'])
    models += f'<div class="section-copy">{title(uid, "models", "models_h")}{copy("models_p1")}{copy("models_p2")}{link("Explore models & pricing", "https://ppq.ai/pricing")}</div>' + media('chat', 'model-picker-recording', uid + '-models') + '</section>'

    usage = section_start(uid, 'usage', 'usage-' + v['usage'])
    usage += f'<div class="section-intro">{title(uid, "usage", "usage_h")}{copy("usage_p")}{link("Check model prices", "https://ppq.ai/pricing")}</div><div class="usage-details">'
    for key in ['job', 'pay', 'balance']:
        usage += f'<div class="usage-item">{copy(key + "_h", "h3")}{copy(key + "_p")}</div>'
    usage += '</div></section>'

    api = section_start(uid, 'api', 'api-' + v['api'])
    api += f'<div class="api-heading">{title(uid, "api", "api_h")}<div class="api-intro">{copy("api_p1")}{copy("api_p2")}</div></div>'
    api += media('api', 'api-opencode-workflow', uid + '-api')
    api += f'<div class="api-details"><div>{copy("connection_h", "h3")}{copy("connection_p")}</div><div>{copy("supported_h", "h3")}{copy("supported_p")}</div>{link("Find an app to connect", "https://ppq.ai/api-docs", "button primary")}</div></section>'

    wallet = section_start(uid, 'wallet', 'wallet-' + v['wallet'])
    wallet += f'<div class="section-copy">{title(uid, "wallet", "wallet_h")}{copy("wallet_p1")}{copy("wallet_p2")}<div class="wallet-action">{link("Start using PPQ", "https://ppq.ai/chat", "button secondary")}{copy("wallet_note", "p", "scope-note")}</div></div>'
    if v['wallet'] == 'split':
        wallet += media('balance', 'balance-and-payments', uid + '-balance')
    else:
        wallet += '<div class="payment-types" aria-label="Payment methods"><span>Bitcoin</span><span>Lightning</span><span>Monero</span></div>'
    wallet += '</section>'

    closing = f'<section class="closing closing-{v["closing"]}" aria-labelledby="{uid}-closing-title"><div>{title(uid, "closing", "close_h")}</div><div class="closing-copy">{copy("close_p")}{actions()}</div></section>'
    footer = f'<footer class="site-footer"><a class="brand" href="https://ppq.ai/chat">{brand()}</a><nav aria-label="Footer"><a href="https://ppq.ai/pricing">Pricing</a><a href="https://ppq.ai/privacy">Privacy</a><a href="https://ppq.ai/api-docs">API docs</a></nav><span>Pay as you go.</span></footer>'
    rail = ''
    if v['id'] == '05':
        rail = '<nav class="chapter-nav" aria-label="Page chapters">' + ''.join(f'<a href="#{uid}-{key}">{name}</a>' for key, name in [('enclave', 'Protection'), ('privacy', 'Privacy'), ('models', 'Models'), ('usage', 'Usage'), ('api', 'API'), ('wallet', 'Access')]) + '</nav>'
    return f'<article class="lp variant-{v["slug"]}" data-variant="{v["id"]}" aria-label="{v["name"]}" lang="en">{header}<main id="{uid}-main">{hero_html}<div class="body-shell wrap">{rail}<div class="chapters"><div class="story">{enclave}{privacy}{models}{usage}{api}{wallet}{closing}</div>{footer}</div></div></main></article>'


def fonts(embedded):
    result = ''
    for family, file, weight in [('PPQ Geist', 'Geist.woff2', '100 900'), ('PPQ Mono', 'GeistMono.woff2', '100 900'), ('PPQ Brand', 'orbitron-latin.woff2', '400 900')]:
        path = 'assets/' + file
        if embedded:
            path = 'data:font/woff2;base64,' + base64.b64encode((ROOT / path).read_bytes()).decode()
        result += f'@font-face{{font-family:"{family}";src:url("{path}") format("woff2");font-weight:{weight};font-display:swap}}'
    return result


def document(body, title_text, embedded=False, review=False):
    style = (ROOT / 'src/styles.css').read_text()
    hydrate = ''
    if embedded:
        flame = base64.b64encode((ROOT / 'assets/flame2.png').read_bytes()).decode()
        style = style.replace('assets/flame2.png', 'data:image/png;base64,' + flame)
        body = body.replace('<a id="standalone-link" href="01-studio.html">Abrir HTML ↗</a>', '')
        for name, scene in [('chat', chat_scene()), ('api', terminal_scene())]:
            body = body.replace(scene, f'<template data-scene-ref="{name}"></template>')
            body += f'<template id="scene-template-{name}">{scene}</template>'
        hydrate = '''document.querySelectorAll('template[data-scene-ref]').forEach(slot => {
  const source = document.getElementById('scene-template-' + slot.dataset.sceneRef)
  slot.replaceWith(source.content.cloneNode(true))
});\n'''
    script = hydrate + (ROOT / 'src/interactions.js').read_text()
    return f'''<!doctype html><html lang="{'pt-BR' if review else 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="description" content="Your favorite AI models, with privacy you can verify. Chat and API, one prepaid balance."><title>{esc(title_text)}</title><style>{fonts(embedded)}{style}</style></head><body class="{'review-mode' if review else 'standalone'}">{body}<script>{script}</script></body></html>'''


def gallery(pages):
    options = ''.join(f'<option value="{v["id"]}">{v["id"]} — {v["name"]}</option>' for v in VARIANTS)
    navigation = '<nav class="variant-list" aria-label="Variações">' + ''.join(f'<button type="button" data-choose="{v["id"]}" aria-pressed="{str(i == 0).lower()}"><span>{v["id"]}</span>{v["name"]}</button>' for i, v in enumerate(VARIANTS)) + '</nav>'
    toolbar = f'''<div class="review-controls"><div class="review-select"><label for="variant-select">Layout</label><select id="variant-select">{options}</select></div><fieldset class="viewport-control"><legend>Prévia</legend><button type="button" data-width="desktop" aria-pressed="true" title="Composição de 1280 px ajustada à largura disponível">Desktop</button><button type="button" data-width="full" aria-pressed="false">Responsiva</button><button type="button" data-width="mobile" aria-pressed="false">390 px</button></fieldset><button type="button" class="global-motion-toggle" aria-pressed="false">Pausar animações</button><label class="notes-control"><input id="notes-toggle" type="checkbox"> Notas de produção</label><a id="standalone-link" href="01-studio.html">Abrir HTML ↗</a></div>{navigation}<div class="review-description"><p id="variant-note">{VARIANTS[0]['note']}</p><span id="variant-inspiration">{VARIANTS[0]['inspiration']}</span></div>'''
    panels = ''.join(f'<div class="variant-panel" data-page="{v["id"]}" {"hidden" if i else ""}>{pages[i]}</div>' for i, v in enumerate(VARIANTS))
    data = '<script type="application/json" id="variant-data">' + json.dumps(VARIANTS, ensure_ascii=False) + '</script>'
    return f'<div class="review-root desktop-preview">{toolbar}<div class="page-viewport">{panels}</div></div>{data}'


def main():
    pages = [page(v) for v in VARIANTS]
    for v, content in zip(VARIANTS, pages):
        (ROOT / f'{v["id"]}-{v["slug"]}.html').write_text(document(content, f'PPQ — {v["name"]}'))
    body = gallery(pages)
    (ROOT / 'index.html').write_text(document(body, 'PPQ — 10 landing page directions', review=True))
    (ROOT / 'preview.html').write_text(document(body, 'PPQ — 10 landing page directions', embedded=True, review=True))
    (ROOT / 'variants.json').write_text(json.dumps(VARIANTS, indent=2, ensure_ascii=False) + '\n')
    print(f'Built {len(pages)} full landing pages, index.html and self-contained preview.html')


if __name__ == '__main__':
    main()
