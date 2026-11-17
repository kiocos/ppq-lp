# API section: review

## Round 2 (A, B, C in `index.html`)

### A · Put the models to work
- **Good:** complete (why, uses, connect, fund); real tools from the guides; the amount → requests block turns "add credit" into something you can picture.
- **Bad:** six boxed cards with the same small orange icon each: predictable and clip-art (user). A boxed grid is also what the brand notes reject. The cards *tell* what an agent does instead of showing it. Code tabs are tabs again. About 2,000 px tall, three separate CTAs. Too long for a page that should stay short.

### B · Same task, two ways
- **Good:** the best line of the round, "The chat answers. The API does the work." Showing a result ("every pull request gets a review") rather than plumbing.
- **Bad:** three of the four jobs sit behind tabs nobody clicks (user). The chat column is filler. YAML means nothing to a non-developer. The payoff, the result, is the smallest text on the panel.

### C · Works with your tools
- **Good:** the orange bar "One key, one balance, every tool." with Add credit on the right: short, clear, one action (user liked it).
- **Bad:** a wall of near-identical buttons; the settings.json panel is neither pretty nor useful (user). It explains *where* to plug in but never *why*.

### What the next version keeps and changes
| Finding | Fix in D (`v3.html`) |
| --- | --- |
| Icons and text describe the uses | Each use is a small working scene made of UI: an agent's terminal passing tests, an assistant thread, a support ticket with names redacted, a table filling from 500 invoices. No icons. |
| Tabs hide content | Everything is visible at once; each scene plays once when it scrolls in, then holds its end state. |
| Too long, boxed grid | Four scenes, 2 × 2, captions outside the panels; one connection strip; one orange bar. About 1,500 px. |
| Button walls | Tool names become a quiet monochrome logo line and plain links under each scene. |
| settings.json | Gone. The only code is the one line that changes, with Copy. |
| Funding | C's orange bar, kept as it was, with the top-up facts. |
| Rhyme | The assistant scene answers the landlord message from the page's privacy demo. Orange marks only what the API is doing right now (the live step, redacted values). |

## Round 3 (D, `v3.html`)
User: "horrível, muito texto". About 30 elements (label, heading, sub, link, four scenes with four texts each, a connect block, a logo row, the bar). The 3–4 ideas rule was applied to the page but not to the section.

## Round 4 (E, `v4.html`)
Four elements: heading, one line, one visual (the agent terminal, four lines), the orange bar from C (title and Add credit). Nothing else.

## Round 4 feedback
"Horrível." The API is the main product: the section must sell it, explain why and what you can build, show the integrations, reveal things little by little with scroll, and can be long. The funding bar must show the crypto options again (Bitcoin, Lightning…), as in D.

## Round 5 (F, `v5.html`)
| Lesson | How F applies it |
| --- | --- |
| 3–4 things at a time (D failed) | Never more than about four elements on screen: one step's title, line and tools beside one scene. The length comes from scrolling, not density. |
| Must sell, can be long (E failed) | Four parts: integrations, four uses, one line, funding. About 4,600 px at 1440. |
| Show integrations | The star: 12 real tool logos around the PayPerQ key; scrolling lights them one by one (rhymes with "One fire lights the next" on this page). |
| No icon cards, no tabs | Uses are working scenes, one at a time; scroll is the only control. |
| Crypto front and centre | Funding bar with Lightning (+5% bonus), Bitcoin, Monero, USDT, Litecoin and card, by name. |
| Orange means live | Lit lines and tiles, the active step number, the live dot, redacted values, the funding bar. |
| Real logos only | Added Cline and Open WebUI from PPQdotAI/public. Strix, TradingAgents and Open Notebook appear as names (no logo on file). |

## Round 6 (G, `v6.html`)
Feedback on F: payment labels unnecessary, put the icons beside Add credit; the PPQ logo in the centre isn't pretty and the api.ppq.ai label isn't needed; scenes must be animated, more stylized, with gradients and interactivity; the chat's warm-grey bubbles were ugly; remove "Change one line".

| Change | Detail |
| --- | --- |
| Core | A light, not a logo: a gradient orb with a flicker, two counter-rotating conic rings, a halo that grows as tools light up. Lines are curved gradients; a bright packet runs from the core to each lit tool; hovering a tool thickens its line and speeds its packet. Top-row labels sit above their tiles so no line crosses them. |
| Scenes | Glass over a warm gradient, top highlight, a soft light that follows the pointer, a 3D tilt toward the pointer, a drifting orange aura that moves per step, and a Replay button. |
| 01 Code | Typed command, a spinner per step, diff, a test bar counting to 128, a green pass, a commit; a meter counts requests and spend. |
| 02 Assistant | Orange-gradient user bubbles, glass assistant bubbles, tool calls (read 14 emails, checked calendar) with spinners, typing dots, streamed replies, a saved-draft card. |
| 03 Product | The customer message types in; a scan passes and the name and email scramble into placeholders; the reply streams with the real values flashing back. |
| 04 Team | Four agents with spinners, progress bars and timers running in parallel (Exploit waits for Injection), then a pulsing critical finding. |
| Funding | Five crypto icons, no labels, beside Add credit. |

## Round 7 (G2, `v7.html`)
Feedback on G: too much gradient everywhere, pointer light too strong; the orange ball should be the PayPerQ logo; too neon; the rotating rings make no sense; illustration too big; the four scenes look alike (a dark window with rows, four times).

Done in G2: flat surfaces (a 2.5% top sheen only), pointer light 3% and tilt ±3°, aura at 22%, flat brand bubbles and bar; the hub is a larger tile with PayPerQ's flame, animated with the app's own loader layers (flame-base + flame-inner, slowed down); no rings, no halo; thinner, dimmer lines; constellation 440 px tall and 980 px wide with 54 px tiles; labels are positioned off the tile so tiles keep even spacing.

Open: the four scenes need four different forms (ideas in the chat reply).

## Round 8 (H, `v8.html`)
Feedback on G2: the flame should move inside the logo, not hop side to side, and slower; the four scenes are still four same-size terminals in the same place.

| Change | Detail |
| --- | --- |
| Flame | No sway, no scale, no flare. The lower half is a still copy; the upper half runs through an SVG turbulence displacement (scale 4.5, 10 s cycle, rising offset), so only the tongues bend. The inner glow pulses over 3.6 s. Two slow embers. |
| 01 Editor | Tabs, line numbers, status bar. A collaborator cursor named Claude Sonnet 5.5 glides to the bug, strikes the line, a "Found it" note appears, it types the fix, tests run to "128 passing", a commit toast. |
| 02 Phone | Portrait device, lock screen clock, notifications drop in newest-first (three at a time): check-in, meeting moved, "Mark accepted the 5% raise" with Draft it, then "Draft saved". |
| 03 Store | Browser with a product page and a support widget. A lens sweeps the customer's message showing the redacted version (same-width placeholders), then the reply streams with the real values. Afterwards the lens follows the pointer (or a finger on phones). |
| 04 Board | No window: three columns, cards carried between them with a FLIP animation, model logos as avatars, progress bars, "1 critical" on the report, then the patch starts and the retest waits. |
