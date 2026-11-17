PPQ — 10 propostas de landing page

Abra index.html para comparar as páginas. Não é necessário iniciar servidor,
instalar dependências ou acessar a internet para fontes e interações locais.
Os links de conversão e documentação apontam para ppq.ai.

Desktop: mostra a composição de 1280 px, ajustada à largura disponível
Responsiva: usa a largura real do painel
390 px: permite avaliar o layout de celular
Notas de produção: mostra sugestões para gravações e a área do Unicorn

Cada proposta também existe como HTML individual:
01-studio.html — equilíbrio entre produto, confiança e conversão
02-workspace.html — interface à direita, proporção aproximada de 62/38
03-panorama.html — mídia ampla e escala visual inspirada no Luma
04-editorial.html — duas cenas de produto e composição assimétrica
05-chapters.html — leitura por capítulos com navegação contextual
06-two-ways.html — chat e API apresentados juntos desde a hero
07-developer.html — terminal à esquerda e CTA principal para API
08-reading-room.html — coluna de leitura com grandes pausas de produto
09-focus.html — composição mais compacta, próxima da interface da PPQ
10-atelier.html — palco vertical e mais espaço para direção de arte

IDENTIDADE E SISTEMA

Geist, Geist Mono, Orbitron e a chama foram reutilizados do frontend PPQDotAI
Geist é a fonte de conteúdo, Mono aparece nas interfaces e Orbitron na marca
Fundo #151515, superfície #1d1d1d, texto #ededed e secundário #bbbbbb
Laranja de ação #bf3c1b e laranja de texto #e97d49
Base de espaçamento de 4 px: 4/8/12/16/24/32/48/64/96/128/160/192/224/256/288
Separação entre capítulos: 192–256 px no desktop, 160 px no tablet e 128 px
no celular. Focus usa 176–224 px e Atelier 224–288 px no desktop.
Seções com divisória recebem ainda 80 px de respiro interno no desktop,
64 px no tablet e 56 px no celular, separando a linha do início da leitura.
Uma grade única controla essas pausas, sem colapso de margens entre seções.
Corpo 17–18 px no desktop e 16 px no celular
Títulos fluidos, peso 500, com medidas limitadas para evitar linhas longas
Divisões próximas a 1:1,618 onde a relação texto/produto favorece a leitura
As medidas de segurança e escopo permanecem junto das afirmações relevantes

MÍDIA REAL

As interfaces são estudos de layout, identificados como tal. Não são capturas
atuais nem demonstrações conectadas. Não enviam prompts nem consomem crédito.
O seletor de modelos apenas demonstra um estado visual. Não é um catálogo.
Os espaços marcados por data-asset-slot permitem substituir a media-frame
por img, picture ou video, preservando a moldura e a hierarquia da seção.
Ao substituir uma área inteira por mídia real, o controlador identifica a
ausência das cenas esquemáticas e remove os controles de animação do estudo.
Vídeos reais devem usar seus próprios controles acessíveis de reprodução.

hero-api-recording / api-opencode-workflow
  Gravar uma sessão do OpenCode conectado à PPQ. Abrir o seletor, escolher
  um modelo e realizar uma tarefa curta. Usar recortes e zoom só para leitura.
hero-chat-recording / model-picker-recording
  Gravar o chat atual: abrir seletor, comparar opções, selecionar e enviar.
enclave-verification
  Capturar código e ferramenta de verificação reais. Explicar o resultado
  mostrado sem ampliar o escopo de proteção ao restante da plataforma.
balance-and-payments
  Usar conta de demonstração com saldo e consumo reais, sem dados pessoais.

O espaço opcional do Unicorn fica atrás da mídia da hero. O embed não foi
carregado: falta escolher e fornecer o projeto real. Sugestão: movimento de
luz baixo e localizado, derivado do laranja da marca, sem partículas, orbes
ou interferência na leitura. Limitar a área animada à hero, suspender fora da
tela e oferecer imagem estática para prefers-reduced-motion e mobile lento.

MOVIMENTO E ACESSIBILIDADE

30 áreas animadas: hero, seletor de modelos e API em cada uma das dez páginas
Ciclos de 16 segundos, com duas cenas ou duas escolhas de modelo
O cursor abre o seletor, destaca e seleciona o modelo, depois digita um pedido
Nas heroes com abas, a sequência passa do OpenCode para o chat após 8 segundos
As cenas são estudos visuais e não enviam pedidos nem simulam respostas reais
Cada área tem pausa, replay e uma barra para explorar os momentos da sequência
O comparador também oferece pausa global
Os ciclos param fora da tela, em versões ocultas e com a aba do navegador oculta
Interações manuais e foco na interface pausam a sequência sem roubar o foco
Entrada da mídia da hero em 880 ms e das demos de modelos e API em 900 ms
Troca de abas em 200 ms, abertura de seletor em 260 ms e estados em 160 ms
Alturas fixas das cenas evitam saltos durante as trocas de abas e modelos
Navegação por âncoras sem scroll hijacking
A copy permanece visível e não recebe efeitos de digitação
prefers-reduced-motion desliga animações, ciclos automáticos e rolagem suave
Nesse modo, Next step permite explorar os estados estáticos por ação explícita
Abas operáveis por setas, Home e End; Escape fecha o seletor de modelos
Links de salto, foco visível, hierarquia de títulos e legendas de escopo

FONTES DA DIREÇÃO VISUAL

Chat publicado: https://ppq.ai/chat
Tokens locais: ../../PPQDotAI/styles/foundation e styles/theme.css
Jitter: https://jitter.video — hierarquia, respiro e demonstrações claras
Luma: referência premiada de 2025 arquivada em research/images nesta workspace
Framer: https://www.framer.com — demonstração de produto em fundo escuro
Imagens das referências: ../research e ../research/dark nesta workspace

MANUTENÇÃO

src/copy.json é a fonte dos 41 blocos da copy acordada
src/build.py contém as composições e gera todas as páginas
src/styles.css contém os tokens, layouts e adaptações responsivas
src/interactions.js contém as interações locais e o comparador

Para regenerar depois de editar as fontes:
  python3 src/build.py

preview.html contém as dez páginas e fontes embutidas para visualização
isolada, com templates compartilhados para reduzir a duplicação das interfaces.
index.html e os HTMLs individuais usam assets/ para fontes e marca.
Mantenha assets/ junto aos arquivos ao copiar esta pasta.

Os documentos são estudos locais completos de composição. Ainda exigem os
assets finais e revisão no frontend de produção antes de qualquer publicação.
