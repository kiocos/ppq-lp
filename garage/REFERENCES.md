# Reference teardown for the garage page (Nov 13, 2026)

Re-captured today with a headless browser (`tools/teardown.mjs`): one screenshot per viewport while scrolling, at 1440 px and 390 px, plus computed type, colour and button styles. Files are in `research/` (`*-d*.png` desktop strips, `*-m*.png` phone strips, `*.json` computed styles). Vercel's `design.md` was fetched again (`research/vercel-design.md`). Fonts In Use pages for the three anchor candidates: `research/fiu-*.png`.

All four references loaded and were inspected. Nothing was skipped.

## Vercel (vercel.com, design.md)

**Measured.** Canvas #000, text #ededed, secondary #a1a1a1. Geist only. H1 64/64 px, weight 400, tracking −0.06em. H2 56 px, weight 450. Lede 24/32 px, weight 450, in two tones ("Notion powers millions" white, "of agent conversations daily on Vercel." grey). Feature lists are 14 px. Page height 5,930 px at 1440.

**New since the last teardown: the hero is a backlit object.** A black triangle sits in front of a soft white glow, so the shape is drawn by the light escaping around it. Headline left, three short claims right, logos on a line below. This is the closest thing on the web to our brief: a dark solid shape defined by light from behind it. It proves the idea reads at hero scale and stays restrained with one light source and no colour.

**Take:**
- One light source, one dark shape, everything else quiet. The light carries the emotion, not the decoration.
- Two-tone sentences for emphasis (already our habit).
- The logo row sits directly under the hero object, a line of real marks as the "who uses it" proof. We'll use the same slot for model makers.
- design.md: "create presence through commitment, not additional effects"; motion only to explain a state change; avoid identical section silhouettes; no eyebrows or decorative section numbers.

**Avoid:** design.md hard-rejects textures, glows and glass. Our brief asks for grain and light, so we keep them inside the star (the door scene) and in one rhymed detail (the light edge), never as page chrome.

## Cursor (cursor.com)

**Measured.** Canvas #f7f7f4, text #26251e, accent orange for links only. CursorGothic; the H1 is only 26 px. Sections are tinted cards with 67 px padding, no rules. Product windows float over impressionist paintings.

**Take:**
- The real product is the hero, staged inside an atmosphere. For us the atmosphere is the garage light and the product is the chat, revealed when the door rolls up.
- Orange used only for links and actions: one meaning for the accent.
- Calm, generous split sections that alternate sides.

**Avoid:** testimonial grids and a long feature catalogue; the page runs 8,200 px. Ours stays short.

## AI Hero (aihero.dev)

**Measured.** Canvas #080808, text #f4f3f1, secondary at 72 % opacity, labels at 60 %. Geist 700 for headlines (H1 76 px, −0.042em), Geist Mono 11 px uppercase labels with 1.3–1.8 px tracking, Source Serif for quotes. One yellow CTA.

**Take:**
- A short row of mono stats under the hero, but with real figures (we have catalogue counts and medians).
- The "Agents" footer column (llms.txt, skills.md); PayPerQ publishes llms.txt.
- An opacity ladder of 100 / 72 / 60 %, close to the skill's 100 / 70 / 50 %.

**Avoid:** the redesign now boxes sections with thin rules and cards, the pattern the user dislikes on Command Code. All-caps tracked labels everywhere also read as template.

## Command Code (commandcode.ai)

**Measured.** Canvas #000, text #fafafa, indigo #4f46e5 family as the one colour. Geist 52 px / 600. "// comment" section labels in mono. Grainy indigo gradient bars as illustration, a version number (v1.89.0) as a display element, sticker cards, a noise-field footer.

**Take:**
- Personality from one committed colour plus texture. For us: amber light plus film grain.
- A version number as a display element. Our equivalent is the live enclave build (v0.75.0, commit ea20ad8), which is also the verification artefact.

**Avoid:** the grid lines, corner ticks and boxed sections. The page reads as a blueprint; our sections are separated by space and light.

## Fonts In Use (anchor candidates)

- **Barlow** (Jeremy Tribby, 2017): 26 uses. Designers pair it with an expressive display face, or with Space Grotesk, Newsreader or GT Pressura Mono. The family is drawn from California public signage (plates, highway signs, buses), a quiet nod to the Palo Alto and Los Altos garages that nobody needs to get. Barlow Condensed gives the condensed-against-regular contrast with Geist.
- **Big Shoulders** (Patric King for the Chicago Design System, 2020): only 2 uses. Civic signage, very tall and narrow. It reads more municipal than workshop, and lowercase gets cramped at headline sizes.
- **Archivo** (Omnibus-Type): 36 uses, usually beside a plain grotesk (DM Sans, Inter, Neue Haas). The expanded width (wdth 125) reads like a stamped equipment nameplate, and it is already the logo study's recommended wordmark.

**Pairings to test in place:** Barlow Condensed + Geist (default), Archivo Expanded + Geist, Geist + Geist Mono. Big Shoulders was tried in the hero mock and dropped (see the mock notes).

## What this means for the garage page

1. The star is a backlit shape, as on Vercel, but with a story: a closed workshop door with work going on behind it.
2. One warm light source. Amber appears only where something is alive: the light under the door, the primary CTA, focus rings, the active nav item, and the bottom light edge on cards.
3. No rules or boxed grids. Sections are separated by space and by the light edge.
4. The real chat is the payoff: the door rolls up and the app is behind it.
5. Short page, conventional order: nav, hero, behind the door (privacy), models, API, pricing, CTA, footer.
