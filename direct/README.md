# PayPerQ landing: 08 Direct

`v2.html` is the current version and `v1.html` the first, plainer one; `index.html` redirects to v2. Both are listed as card 08 in the shared hub, `../uniform/index.html`. Press **T** to cycle the type pairings.

## v2 (after "too basic, buttons have no appeal, no motion, no emotion")

- **Buttons:** lit orange gradient with an inner highlight, a dark arrow chip that springs on hover, and a sheen that sweeps across. The secondary button has a gradient border that turns orange on hover.
- **Hero:** larger Archivo Semi-Expanded headline with "privately." in orange. The real demo sits on a warm, grainy orange panel whose light drifts slowly, with a "verified" chip.
- **Motion that explains, one per idea:**
  - privacy: a message types on the left and appears only as noise on the orange "What PayPerQ sees" card, with the model, token count and time still readable;
  - models: two strips of real model names drift past, with a big 388 counting up;
  - API: the code rewrites `base_url` and the key in place;
  - pricing: "$0.10 ≈ 43 messages on Claude Haiku 5.5" counts up, and the price bars grow.
- All of it is DOM/CSS (crisp text, a few KB, no extra video). Under reduced motion, every piece shows its final state.

## v1: what changed from the earlier directions

- **No star.** The page carries itself with hierarchy, spacing, short copy and two solid PPQ-orange blocks (who sees what, and "$0.10 to start"), in the spirit of Command Code's single colour block. Orange also marks the primary buttons and the one changed line of code, and nothing else.
- **Short copy.** One headline and one line per section, and each section answers one question:
  - privacy: who can see what;
  - models: which ones;
  - API: what you change;
  - pricing: what it costs.
- **Small demo.** A tight 4:3 crop of the real chat, about 520 px wide, roughly 460 KB (the garage roll-up was 4.5 MB). Phones get a portrait cut zoomed so the model names and the "Verified" line stay readable.
- **About 3,500 px tall at 1440**, against 7,300 px for garage r3.

## Facts (Nov 13, 2026; re-check before publishing)

Same sources as `../garage/facts/`:
- 388 chat models from 66 providers;
- enclave build v0.75.0;
- Lightning top-ups from $0.10;
- median cost per message: Haiku 5.5 $0.0023, GPT-6 Luna $0.0177, Sonnet 5.5 $0.0512, Opus 5.5 $0.1339. The page rounds these to three decimals.

The demo is the real app with a written example conversation and a staged balance. Model tiles are labelled by family (GPT, Claude, Gemini, Grok, DeepSeek, Qwen, Kimi, GLM, Mistral, MiniMax, Command).

## Regenerate

- Demo: `cd ../garage/motion && npx remotion render src/index.ts Demo …` (`src/Demo.tsx`; `DemoTall` for phones).
- Screens: `cd ../garage/tools && OUT=../../direct/review node pageshot.mjs ../../direct/v2.html`.
- "43 messages" = $0.10 / $0.0023 (Haiku 5.5 median per message, Nov 13, 2026).
