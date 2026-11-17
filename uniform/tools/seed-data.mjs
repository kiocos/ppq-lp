// Scripted conversations rendered by the real chat UI. Prompts and replies are written for the captures
import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync('/tmp/ppq-models.json', 'utf8')).data.chatModels;
const model = (id) => {
  const m = catalog.find((x) => x.id === id);
  if (!m) throw new Error('model not in catalog: ' + id);
  return m;
};

const day = (d, h = 10, min = 0) => new Date(Date.UTC(2026, 10, d, h, min)).toISOString();
let n = 0;
const uid = (p) => `${p}-${(++n).toString(16).padStart(4, '0')}-4a1e-9c2b-5f00ppq${n}`;

const ai = (m, content, priceUsd, inTok, outTok) => ({
  id: uid('m'), role: 'assistant', content, servedByEnclave: true,
  queryCost: { model_id: m.id, input_count: inTok, output_count: outTok, price_in_usd: priceUsd },
});
const me = (content) => ({ id: uid('m'), role: 'user', content });

const conv = (id, name, m, messages, created, extra = {}) => ({
  id, name, model: m, messages, temperature: 1, folderId: null, prompt: '',
  created_at: created, updated_at: created, dataSource: null, ...extra,
});

const OPUS = model('anthropic/claude-opus-5.5');
const LUNA = model('openai/gpt-6-luna');
const GLM = model('z-ai/glm-5.3');
const ARGON = model('google/gemini-4-argon');
const HAIKU = model('anthropic/claude-haiku-5.5');

export const conversations = [
  conv('c-ratelimit', 'Token bucket race condition', OPUS, [
    me(`Is this rate limiter safe when many requests hit it at once?

func (b *Bucket) Allow() bool {
    now := time.Now()
    b.tokens += now.Sub(b.last).Seconds() * b.rate
    b.last = now
    if b.tokens > b.cap { b.tokens = b.cap }
    if b.tokens < 1 { return false }
    b.tokens--
    return true
}`),
    ai(OPUS, `No. \`Allow\` reads and writes \`tokens\` and \`last\` without synchronization, so two goroutines can refill from the same timestamp and both spend the last token.

**What goes wrong**

- Two calls read \`b.last\` before either one writes it, so the refill is counted twice.
- \`b.tokens--\` is not atomic. Under load the bucket can go negative and let extra requests through.

**Fix: guard the critical section**

\`\`\`go
type Bucket struct {
    mu        sync.Mutex
    tokens    float64
    last      time.Time
    rate, cap float64
}

func (b *Bucket) Allow() bool {
    b.mu.Lock()
    defer b.mu.Unlock()

    now := time.Now()
    b.tokens = min(b.cap, b.tokens+now.Sub(b.last).Seconds()*b.rate)
    b.last = now
    if b.tokens < 1 {
        return false
    }
    b.tokens--
    return true
}
\`\`\`

Run your tests with \`go test -race\` to confirm the fix. If profiling later shows contention on the mutex, \`golang.org/x/time/rate\` implements the same algorithm and is safe for concurrent use.`, 0.0412, 1840, 412),
  ], day(13, 16, 20)),

  conv('c-landlord', 'Reply to rent increase', LUNA, [
    me(`My landlord wants to raise the rent 18% at renewal. Draft a short, polite reply asking to keep it under 6%. I've lived here 3 years and always paid on time.`),
    ai(LUNA, `Here's a draft you can adjust:

> Hi Daniel,
>
> Thanks for sending the renewal terms. I'd like to stay, and I hope we can find a number that works for both of us.
>
> An 18% increase is more than I can take on this year. I've paid on time every month for three years and taken good care of the apartment, so I'd like to ask whether you'd consider keeping the increase under 6%.
>
> I'm also happy to sign a longer lease if that helps. Could we talk this week?
>
> Best,
> Sam

**Why this works**

- It opens with your intent to stay, which is what a landlord wants to hear.
- It asks for one concrete number instead of a range.
- The longer lease gives them a reason to say yes.`, 0.0081, 640, 268),
  ], day(13, 11, 5)),

  conv('c-lightning', 'How Lightning routes a payment', GLM, [
    me(`Explain how a Lightning payment reaches someone I don't have a channel with. Five bullets, no jargon.`),
    ai(GLM, `- **You don't need a direct channel.** Your wallet finds a path of connected channels from you to the recipient, a bit like connecting flights.
- **Each hop forwards the payment.** Every node on the path passes the amount along and keeps a tiny fee for doing it.
- **It settles all at once, or not at all.** The payment is locked to a secret only the recipient knows. When they reveal it to claim the money, every hop can claim its part. If anything fails, nobody loses funds.
- **Nodes only see their neighbors.** Each hop knows who handed it the payment and who it hands it to, not the whole route.
- **Failed paths are retried.** If a channel along the way lacks capacity, your wallet tries another route, usually within seconds.`, 0.0034, 410, 236),
  ], day(12, 21, 40)),

  conv('c-node', 'Self-hosting a Bitcoin node', ARGON, [
    me('What hardware do I need to run a Bitcoin node at home in 2026?'),
    ai(ARGON, 'A small fanless mini PC with 16 GB of RAM and a 2 TB NVMe drive is the comfortable baseline. The initial sync is the only demanding part; after that the node idles at a few watts.', 0.0102, 220, 96),
  ], day(12, 9, 15)),

  conv('c-lisbon', 'Lisbon in four days', HAIKU, [
    me('Plan four relaxed days in Lisbon in March. I like walking, bookshops and seafood.'),
    ai(HAIKU, 'Day 1: Alfama and the castle at sunset. Day 2: Chiado bookshops, Bertrand and Ler Devagar. Day 3: Belém by tram, pastéis at the source. Day 4: a train to Cascais for seafood by the water.', 0.0011, 180, 140),
  ], day(11, 18, 2)),

  conv('c-board', 'Summarize Q3 board notes', OPUS, [
    me('Summarize these board notes into five decisions and owners.'),
    ai(OPUS, '1. Approve the Q4 hiring plan (Ana). 2. Move the EU launch to February (Tomás). 3. Renew the audit firm (Priya). 4. Pause the partner program pilot (Leo). 5. Publish the security report in December (Ana).', 0.0388, 3120, 120),
  ], day(10, 14, 30)),
];

export const ids = { code: 'c-ratelimit', writing: 'c-landlord', lightning: 'c-lightning' };
