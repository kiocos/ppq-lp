PPQ — landing cypherpunk

Abra index.html direto no navegador. Não precisa de servidor nem de internet:
fontes, imagem e scripts são todos locais. A página não carrega nada de
terceiros. O rodapé afirma isso, então mantenha assim.

ARQUIVOS
  index.html   v3 (atual): copy final do GPT, 8 seções, animações
  styles.css   tokens, temas claro/escuro, layout e animações da v3
  main.js      tema por seção, reveal, timeline do enclave, abas de privacidade,
               seletor de modelos, carteira, barra de progresso, loader do Unicorn
  v4-heroes.html  v4: comparação de 5 heros (A–E) + tipografia das seções (F). Painel embaixo troca
               a fonte do título (Geist, Geist Mono, Mona Sans, Hubot Sans, Bricolage, Newsreader) e a
               ênfase (cor, tom, nenhuma); sem itálico. A escolha fica na URL (?font=…&em=…).
               Arquivos: v4-heroes.css, v4-heroes.js. Teclas: J/K ou 1–6 (estudos), F (fonte), E (ênfase).
               Fontes novas em assets/ (OFL, TTF variável ~350–450 KB): converter para woff2 com subset
               antes de ir para produção.
  v5-firehole.html  v5: heros com a metáfora do Dakota fire hole (fogo escondido num buraco no
               chão, com um canal de ar). A Corte noturno (céu azul, lua crescente, serra com névoa
               e pinheiros; uma pessoa sentada num tronco mexe uma panela apoiada em dois galhos
               na boca do buraco; fogo pequeno em camadas; sem faíscas), B Prancha técnica (papel, linha de
               visada), C Lente (corte revelado por uma lente; segue o cursor no desktop),
               D Escotilha (corte num círculo, no lugar do eclipse), E Seção de apoio
               (fogueira vs. fire hole). Mesmo painel da v4 (recolhido no canto: "Aa"), mais
               "Título" para testar "You build the fire. We sell the wood." (?copy=wood).
               Arquivos: v5-firehole.css, v5-firehole.js. Teclas: J/K ou 1–5, F, E, T.
               Estrelas = famílias de modelos do catálogo público; sem logos.
               As estrelas e pedrinhas são SVG estático, geradas uma vez (seed fixo).
  v6-verify.html  v6: três pranchas que desenham a "verificação" (a promessa "privacy you can verify").
               Reaproveita v5-firehole.css (tokens, hero, prancha) e acrescenta v6-verify.css/.js.
               A Fique aqui (corte do fire hole com duas linhas de visada laterais bloqueadas e uma vista
               de cima visível: limite honesto; "vá até o marcador e olhe"), B Talha dividida (vara de
               lenha rachada, entalhes e fibras que só batem se as metades forem do mesmo graveto; um
               entalhe por consulta, o saldo é o que sobra), C Câmera térmica (vê calor, não a chama nem
               a luz: mostra o que NÃO está escondido). Teclas: J/K ou 1–3. Sem painel de fonte.
               Ressalvas: B só vale se o saldo for de fato verificável pelo usuário; C precisa de legenda
               honesta (a pessoa aparece). Cada imagem deve apontar para um artefato real (código aberto,
               atestação, HTML sem rastreadores).
  v2.html      v2: versão contida e curta (v2.css, v2.js)
  v1.html      v1: versão colorida (v1.css, v1.js)
  assets/      Geist, Geist Mono, Orbitron (wordmark), Instrument Serif (itálico) e a chama

COPY DA V3
  Texto final da conversa com o GPT ("Evaluate PayPerQ Privacy Storytelling"),
  idêntico a landing-pages/src/copy.json. Ordem: hero → enclave → privacidade
  do provedor → modelos → pagamento por uso → API → carteira → fechamento.
  Os únicos textos novos são rótulos curtos dentro das ilustrações (ex.:
  "Your device", "PPQ servers & logs", "At the provider", "Spending by day").

MOVIMENTO DA V3
  - O fundo da página faz crossfade entre tinta e papel conforme a seção no meio da tela
    (enclave escuro → privacidade, modelos e preço claros → API, carteira e fim escuros)
  - Hero: título sobe em máscara, eclipse nasce devagar
  - Enclave: o pedido sai cifrado do dispositivo, só fica legível dentro do enclave,
    segue ao provedor; os servidores da PPQ recebem apenas "route · bill"
  - Privacidade: abas Anon / ZDR / E2EE alternam sozinhas (pausam no hover ou clique)
    e mostram o que chega ao provedor: guardado, dissolvido ou cifrado
  - Modelos: seleção alterna entre Claude, GPT e open-weight, sempre no mesmo saldo
  - Preço: barras de gasto crescem só nos dias com uso
  - API: pulsos vão dos apps ao PPQ API e aos modelos
  - Carteira: Bitcoin, Lightning e Monero alimentam um único saldo
  - Tudo pausa fora da tela; com prefers-reduced-motion a página fica estática e completa

UNICORN STUDIO
  Na v2 há um slot, no fundo da hero (.unicorn-slot).
  1. Exporte o projeto e cole o id em data-us-project (ou use
     data-us-project-src com o JSON exportado e hospedado junto da página).
  2. Baixe o runtime unicornStudio.umd.js e salve em assets/. Não use o CDN:
     isso quebraria a promessa de zero scripts de terceiros.
  3. Com o projeto presente, main.js carrega o runtime e esconde o eclipse em CSS.
     Com prefers-reduced-motion ativo, o Unicorn não é carregado.
  Sugestão de direção: manter a contenção da v2. Um disco escuro com um aro de luz
  laranja, movimento lento, sem partículas. Pode reagir de leve ao cursor.

FATOS USADOS NA COPY (confirmar antes de publicar)
  Fonte: posts do blog da PPQ (Enclave Router, 30/09/2026; tiers Anon/ZDR/TEE)
  e o catálogo público api.ppq.ai/v1/models.
  - Recarga a partir de $0.10 e "cerca de 1 centavo por query em média"
  - Pagamentos: Bitcoin on-chain, Lightning, Monero, stablecoins, outras moedas e cartão
  - Email opcional, conta = credit id; histórico no navegador por padrão
  - Todo chat (web e API) passa pelo enclave Nitro; mídia e pesquisa ainda não
  - Recibo de roteamento assinado; código do enclave aberto e com build reproduzível
  - Verificador: npx ppq-private-mode (repo PayPerQ/ppq-privacy-verifier)
  - Exceção da OpenAI: hash com chave do credit id
  - Modelo do exemplo de API: private/kimi-k3-1-pro (existe no catálogo hoje)
