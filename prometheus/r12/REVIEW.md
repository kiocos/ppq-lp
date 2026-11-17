# Prometheus r12 — revisão de copy, SEO e conversão

16 de novembro de 2026. Nova versão: [prometheus.html](prometheus.html). Base: [r10](../r10/prometheus.html), destino atual de `prometheus/index.html`. A r11 é outro estudo de layout e não foi alterada.

## Avaliação

A página já tinha bons argumentos: escolha de modelos, enclave verificável, uso sem conta e pagamento por consumo. O problema estava na execução. A privacidade era repetida como uma promessa ampla, a seção de chat acrescentava pouco à história, e parte da API vendia capacidades dos agentes sem explicar suficientemente o papel da PPQ.

Para o público que você definiu — Bitcoiners, usuários de Monero, cypherpunks e libertários — minha hipótese é que autonomia demonstrável persuade mais do que linguagem de rebeldia. Escolher modelos, verificar o intermediário, usar os próprios programas e financiar um saldo sem assinatura são provas concretas dessa autonomia. Isso é uma interpretação editorial do público estabelecido, não um resultado de teste de conversão.

A nova copy mantém o inglês da página. Preserva a hero aprovada, a atmosfera de Prometheus e o encerramento “The fire is yours.” A história do produto passa a avançar em cada seção.

## Suas preferências usadas como critério

Consultei o [registro de opções aprovadas](../../hero-shortlist.md), o [histórico local do Prometheus](../README.md) e as conversas anteriores:

- <t3-thread://v2/d0c03446-eee1-4e20-ae80-10123d4eb7b1/7a6201b7-f2f4-4083-9a9a-23fb0f86ddab>
- <t3-thread://v2/d0c03446-eee1-4e20-ae80-10123d4eb7b1/fcbbb4c2-e20e-48d8-b727-b091958a0d56>

Critérios recuperados: apresentar claramente IA e flexibilidade; evitar abstração e frases genéricas; encontrar o meio-termo entre slogan curto demais e parágrafo longo demais; conectar título e subtítulo; ensinar o valor da API a quem ainda não sabe o que ela faz; mostrar usos e integrações reais; dar destaque ao enclave; não colocar fogo ou mitologia na copy da hero; não recuperar “From $0.10” na hero; manter o fechamento que você aprovou.

Por isso, não substituí “Chat and build privately.” por uma lista de palavras-chave nem pelo título longo da shortlist. A hero atual tem `white-space: nowrap`; a categoria e os modelos ficam explícitos no subtítulo e no título de SEO, sem exigir mudança de layout.

## Pesquisa: o que tem sustentação

Não existe uma fórmula consensual que garanta ranking ou conversão. Há convergência entre orientações oficiais de busca, pesquisa de usabilidade e prática de conversão. Usei cada fonte dentro de seu alcance:

| Referência | Princípio aplicado | Limite da evidência |
| --- | --- | --- |
| [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | Descrever a oferta com palavras que o visitante reconhece; organizar o conteúdo; usar links com nomes informativos | Não determina quais termos têm demanda para a PPQ |
| [Google: conteúdo útil e confiável](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Resolver dúvidas reais do público e sustentar afirmações verificáveis | Não oferece uma fórmula de landing page |
| [Google: títulos dos resultados](https://developers.google.com/search/docs/appearance/title-link) | Título específico, conciso e coerente com a página, sem repetição artificial | O Google pode reescrever o título; não existe limite universal de caracteres |
| [Google: descrições dos resultados](https://developers.google.com/search/docs/appearance/snippet) | Meta description como resumo útil da oferta | O snippet pode vir do corpo e variar por busca; escrever a descrição não garante posição |
| [Nielsen Norman Group: leitura na web](https://www.nngroup.com/articles/how-users-read-on-the-web/) | Títulos informativos, uma ideia por bloco, linguagem objetiva e texto fácil de escanear | Estudo de usabilidade, não estimativa de aumento de vendas para a PPQ |
| [CXL / Peep Laja: proposta de valor](https://cxl.com/blog/value-proposition-examples-how-to-create/) | Explicar relevância, benefício e diferença; validar a mensagem com clientes | Orientação de um especialista, não lei universal sobre estrutura ou conversão |
| [Mullvad: diferenciais](https://mullvad.net/en/why-mullvad-vpn) | Traduzir filosofia de privacidade em decisões concretas do produto | Referência editorial; não temos os dados de conversão da Mullvad |
| [Signal: página inicial](https://signal.org/) | Apresentar o uso desejado junto da proteção que o viabiliza | A arquitetura do Signal não autoriza copiar suas garantias para a PPQ |

Não apliquei densidade de palavras-chave, tamanho mínimo de texto, urgência artificial ou uma sequência obrigatória de “dor → medo → solução”. Nada disso substitui clareza e evidência sobre esta oferta.

## O que precisava melhorar

| Trecho ou decisão da r10 | Problema | Mudança na r12 |
| --- | --- | --- |
| Hero com “Your favorite AI models…” | Boa direção, mas poucos elementos concretos para quem chega sem conhecer o produto | Cita Claude, GPT e Gemini e apresenta chat e conexão de ferramentas |
| “Most AI apps keep your chats. We can't even read them.” | Comparação ampla sem comprovação e repetição do argumento anterior | Chat passa a tratar da escolha do modelo para cada tarefa |
| “PayPerQ can't read your chats on any model” | Universaliza a proteção, apesar das exceções documentadas | Delimita o enclave e informa exclusões no texto principal e no composer |
| “Decrypted only inside the enclave” | Pode sugerir que o provedor convencional também não acessa o prompt | Separa a proteção contra a PPQ da proteção contra o host do modelo |
| “Use PayPerQ through the API.” | Nomeia o canal, mas pouco explica o ganho | “One AI API for your apps and agents.”, com definição simples e saldo compartilhado |
| Agente “runs the tests until they pass” | Parece garantia de resultado; a capacidade pertence à ferramenta conectada | Explica conexão, solicitação de alteração, revisão pelo usuário e pagamento por uso |
| Nomes e emails “are replaced” | Faz um recurso opcional parecer automático e infalível | Usa “Enable” e “detected” na descrição de PII redaction |
| “See all integrations” → `/integrate` | O destino público é uma página de parcerias | “Explore app partnerships”; os guias de ferramentas continuam nos links existentes |
| Preços por mensagem sem identificar web/API | Pode fazer as medianas históricas parecerem tarifa fixa ou preço da API | Identifica exemplos de web chat, data, cobrança por tokens e variação pelo uso |
| “Opening the chat with your message…” | O script apenas mostra uma simulação; não abre nem envia a mensagem | Orienta a abrir o produto por “Start chatting”, sem alterar o comportamento |

As correções de escopo seguem a [página pública de privacidade da PPQ](https://ppq.ai/private-ai). O funcionamento do roteador foi conferido no [artigo do Enclave Router](https://ppq.ai/blog/introducing-the-enclave-router), no [código público](https://github.com/PayPerQ/ppq-enclave-proxy) e no [verificador](https://github.com/PayPerQ/ppq-privacy-verifier). A natureza opcional de PII redaction está descrita no [anúncio do recurso](https://ppq.ai/blog/pii-redaction). A distinção entre cobrança por tokens e exemplos por mensagem segue a [página de preços](https://ppq.ai/pricing).

## Storytelling escolhido

O visitante é quem decide o que fazer com a IA. A PPQ oferece acesso, meios de verificação e uma forma de pagamento flexível. A narrativa usa a ordem de seções que já existe:

1. **Hero — reconhecer a oferta.** Modelos conhecidos, privacidade verificável, chat e API. Um caminho imediato pelo chat e um caminho exploratório para a API.
2. **Privacidade — justificar a confiança.** Mostrar o trajeto da requisição, o que a PPQ consegue ver e o que muda conforme o provedor. A verificação tem uma explicação concreta.
3. **API — ampliar o que o usuário pode fazer.** Sair do chatbot para o editor, o assistente no próprio servidor, o produto e as ferramentas com vários agentes. Explicar onde entram a chave e o saldo da PPQ.
4. **Chat — oferecer uma entrada acessível.** Escolher um modelo e suas proteções sem precisar começar pela configuração de uma integração.
5. **Preço e fechamento — tornar a decisão tangível.** Um saldo, pagamento por uso, métodos de pagamento reconhecíveis e um próximo passo claro.

A metáfora de Prometheus continua na arte e no fechamento. Não forcei “liberdade”, “soberania” ou “revolução” em todos os blocos. Minha escolha editorial foi deixar a liberdade aparecer nas decisões que o produto permite tomar.

## SEO da nova versão

As expressões abaixo são hipóteses de intenção baseadas na oferta, não palavras-chave com volume ou dificuldade medidos. Não tive acesso ao Search Console nem a dados de campanhas.

| Intenção | Onde a copy responde |
| --- | --- |
| Private AI chat / chat sem conta | Título, hero, privacidade e seção de chat |
| AI API / OpenAI-compatible API | Título e seção da API, com endpoint e usos concretos |
| Pay-as-you-go AI / sem assinatura | Hero, seção de preço e descrição do resultado |
| Usar IA pagando com Bitcoin ou Monero | Texto de pagamento e meta description |

Evitei transformar “anonymous AI”, “uncensored” ou “no logs” em garantias gerais. A página deve atrair pessoas cuja necessidade o produto realmente atende. Imagens de moedas, sozinhas, também não explicavam suficientemente as opções de pagamento; os nomes agora aparecem em texto visível.

**Título — 46 caracteres:**

> Private AI Chat & API, Pay as You Go | PayPerQ

**Meta description — 150 caracteres:**

> Use Claude, GPT, Gemini and more in one chat and API. Verify chat privacy, pay with Bitcoin or Monero, and skip the subscription. No account required.

Esses comprimentos são decisões editoriais para esta versão, não limites de ranking definidos pelo Google. O título de SEO pode ser mais descritivo que a headline visual, mantendo o mesmo assunto.

## Quatro rodadas de revisão realizadas

Foram quatro passagens próprias sobre a copy, com alterações entre elas. Não foram avaliações independentes nem testes com usuários.

| Rodada | Critério | Correções realizadas |
| --- | --- | --- |
| 1 | Público, preferências anteriores e progressão da história | Trocou repetição de privacidade no chat por escolha de modelos; explicou a API; ligou usos concretos à chave e ao saldo |
| 2 | Exatidão das promessas | Delimitou enclave, metadados e provedor; qualificou PII; distinguiu políticas de retenção de E2EE; identificou os preços como exemplos históricos |
| 3 | Intenção de busca e clareza dos caminhos | Reescreveu title/meta; melhorou textos de links; corrigiu a promessa do link de parcerias; explicou as siglas na primeira passagem relevante |
| 4 | Ritmo, concisão e coerência com o funcionamento | Enxugou os quatro exemplos da API; retirou “Chat here”; corrigiu a mensagem falsa de envio; fechou com “Start with a conversation. Build what comes next.” |

No fim, reli os títulos como uma sequência, os CTAs com seus destinos e a comparação completa com a r10. Mantive os detalhes técnicos no disclosure existente e as exclusões essenciais perto da promessa principal.

## Validação e limites

A validação estática confirmou a mesma sequência de 1.066 eventos estruturais de HTML, um H1, os mesmos IDs, destinos, imagens e atributos funcionais. O CSS inline, `story.css` e `story.js` permanecem idênticos à base. As únicas mudanças no JavaScript são três textos exibidos ao usuário: dois tooltips e o rótulo do modelo selecionado. Todos os scripts inline passaram em `node --check` e os caminhos locais e âncoras resolvem.

Também reverti programaticamente a lista de substituições em memória e obtive exatamente o HTML original. A r10 permaneceu intacta. Não fiz validação visual em navegador; textos mais longos podem mudar quebras de linha e a altura dos blocos, embora as regras de layout sejam as mesmas.

Os valores da tabela e a estimativa de 43 mensagens foram conferidos no [snapshot de preços](../facts/models-pricing.json). São medianas de web chat de 14/11/2026, não cota garantida nem preços atuais da API. A regra de faturamento foi conferida na documentação pública. Não atualizei números históricos para fazê-los parecer dados ao vivo.

Pontos que continuam fora da mudança de copy:

- Os dois links de lojas continuam com `href="#"`. Isso impede a conversão pretendida por esses botões. Há uma [listagem pública para iPhone](https://apps.apple.com/id/app/ppq/id6779657927); a busca realizada não confirmou uma listagem Android. Não inferi que ela não existe, nem inventei uma data de lançamento.
- O composer continua demonstrativo. A mensagem agora descreve corretamente o próximo passo, mas o envio real exigiria integração funcional.
- A animação ilustra a verificação; não atesta um enclave ao vivo nesta página. O texto explica que a checagem real acontece antes do envio.
- Esta pasta é uma versão de revisão. Não foi publicada nem virou o destino de `index.html`. Ao publicar a escolhida, é preciso decidir a URL principal e o tratamento dos estudos duplicados; não atribuí uma canonical de produção por suposição.

Não há evidência de aumento de tráfego ou conversão ainda. A avaliação seguinte deveria acompanhar consultas e cliques orgânicos, abertura do chat, primeiro uso pago, criação de chave e primeira chamada paga da API, usando apenas a instrumentação já autorizada pela PPQ. Como você definiu a API como prioridade de receita, clique no CTA sozinho seria uma medida insuficiente de sucesso.
