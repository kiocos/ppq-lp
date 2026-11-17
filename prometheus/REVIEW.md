# 09 Prometheus: review log

Each round was rendered at 1440 and 390 px (`review/`) and read against the skill's checklist.

## Round 1 → fixed in round 1 while building

| Finding | Fix |
| --- | --- |
| The nav's "Start chatting" button sat on top of Olympus, the lit temple in the canvas's top-right corner. | The nav button now appears only after the hero has scrolled away. |
| The left half of the hero was a black slab: the shade hid the painted sky and valley. | Shade cut by about a third; the bottom fade shortened so the valley's dwellings show. |
| The privacy detail was a second portrait of Prometheus and competed with the hero. | Cropped to the hand and stalk, so the picture is about the hidden ember. |
| Phone hero cut the figure's head at the left edge. | Canvas shifted; headline in the sky, buttons on the rock, figure in between. |
| The demo panel's side-light was too faint to read as firelight. | Stronger glow from the lower left. |

## Round 1 → fixed in round 2

| Finding | Fix |
| --- | --- |
| Label text on glass over light rock measured about 3.7:1. | Glass at 80% opacity, small text raised one level: 7.3:1. |
| Hero sub line wrapped with a short last line. | `text-wrap: balance`. |
| On phones the privacy picture came before its heading. | Heading and demo first, picture after. |
| The closing picture (`valley-fires`) had smoke columns and large blazes. It could read as a valley on fire, which is loss, not hearths. | New painting, `valley-hearths`: lit doorways, small ringed fires, no smoke. A portrait canvas for phones. |
| The closing fade hid the ridge and sky behind the heading. | Lighter fade. |
| On phones, the closing buttons sat on the torch. | The portrait canvas keeps the words in the sky. |
| Detail label mixed "fire" with "read". | "Sealed in a hollow stalk, the fire went past every watching eye." |
| Phone hero buttons took two rows and covered more of the figure. | One row (the "API" chip hides under 520 px). |

## Round 2 re-take: The Theft (`r2/theft.html`)

Deliberately different on five counts: the painting (the moment at the gods' hearth, the gods feasting with their backs turned), the verb ("Steal the fire."), the type (Newsreader, upright), the layout (words low on the canvas, a paper wall label beside its lower edge) and the surface (paper catalogue pages between two dark canvases).

What it showed:
- The theft is the more dramatic picture, and the gods looking away tells the story without a caption.
- His furtive look and the word "Steal" lean toward the outlaw tone the brand avoids. The descent is calmer: he has the fire and is on his way.
- The paper pages are the strongest surprise in the study, and they work with either hero.
- Paper needed its own orange for text (`#b53d0c`, 4.9:1) and darker small text (`#645c51`, 5.0:1 on panels).

## Checklist, round 2

- First screen says what it is: headline, "Your favorite AI models, with privacy you can verify.", three facts. Yes.
- Four ideas, six blocks, about 5,300 px at 1440. Yes.
- Type: three pairings in place, no italics. Star: one, reads as Prometheus with fire; the label is a bonus. Rhyme, depth, opacity: see README. Re-take: done.
- Contrast (measured): dark fg-2 9.3, fg-3 5.9 on page and 5.6 on panels; text on orange 5.1 to 5.4; paper fg-2 7.7, fg-3 5.6 and 5.0 on panels.
- No horizontal overflow at 390; no console errors; no external requests; every referenced file exists.
- Videos use `preload="none"` and play in view; reduced motion stops the flicker and shows final states.

## Open

- Sources are 1672 px; re-render at 4K (see README).
- The descent figure is the hero on phones but Olympus is cropped out there.
- No Remotion piece in this direction: the star is a still, and its only motion is the ember flicker in CSS.

## Round 3: your notes (Nov 14) and how each was handled

| Note | Change |
| --- | --- |
| Don't overuse the Prometheus images; hero only (footer is fine). | The painted detail in the privacy section was removed. Paintings remain in the hero and the closing valley. |
| Use the product itself for the details. | The privacy section shows the app's real privacy panel: who can see what, and "Verified by your browser · Build v0.75.0 matches GitHub". |
| Hero copy shouldn't mention fire; use the approved PPQ and privacy copy. | "Chat and build privately." / "Your favorite AI models, with privacy you can verify." The fire caption is gone, and the API heading is back to the approved "Your models can work beyond this chat." |
| Don't like the orange. | Switched to PPQ's own brand token from the app theme, `#bf3c1b`. |
| Buttons too stylized and too rounded. | Flat fill or 1 px outline, 6 px radius, no arrows, sheen or glow. |
| Hero image should draw less attention. | 42% opacity, slightly desaturated, no flicker. |
| More restrained, smaller, calmer type, like the reference. | Measured the reference (48 px regular headline, 18 px body). Hero 52 px, sections 36 px, all display weight 400, no colour emphasis. Cards, chips and pills went from 16–28 px radii to 6–12 px. |

### Self-review after the first render of round 3

| Finding | Fix |
| --- | --- |
| A tall empty band under the hero copy before the first section. | Hero height reduced from 90 to 80 svh, with a 780 px cap. |
| The secondary button outline almost disappeared on the dark page (about 1.6:1). | Outline raised to 34% white: 3.0:1. |

### Your note: Prometheus's head was cut off

The painting box was centred vertically and was taller than the hero, so its top (the head, about 2% below the canvas's edge) was cropped and sat under the nav.

| Change | Why |
| --- | --- |
| The canvas now hangs from 40 px below the top of the page at full width; anything past the bottom of the hero (the feet) is clipped and faded. | The head always lands 95–140 px down, below the nav, at 1024–1920 px wide. |
| `tools/art-tall.mjs` adds 64 px of sky above the painting (the top of the sky mirrored and blurred, blended with the painting's first rows) → `hero-tall-*.webp`. | The page can fade the canvas's top edge over the added sky instead of over his hair. A first version showed a thin line at the join; it was fixed by also replacing the painting's first 8 rows and easing the fade. |
| Phones: the portrait canvas hangs from 148 px, 120% of the screen width, shifted toward the figure. | His face was under the "No account · …" line and his shoulder was cut at the left edge. |

Checked at 1440×900, 1280×720, 1920×1080, 1024×768, 430×932, 390×844 and 360×740 (`review/r3-hero-*.png`).

### Checklist, round 3

- First screen: what it is, the promise, two actions, three facts. The painting no longer competes with them.
- Type: Geist Regular plus two calm alternatives, tested in place (`review/r3-prometheus-t2-*`, `-t3-*`). No italics, no colour emphasis.
- Contrast: white on brand 5.4:1, white at 92% on brand 4.7:1, fg-2 7.5:1 and fg-3 5.4:1 on the page, fg-3 5.1:1 on panels.
- No horizontal overflow at 390 px, no console errors, no external requests, every referenced file exists. The page is about 4,900 px tall at 1440, against 5,300 px in round 2.

### Open

- The closing still says "The fire is yours." because you said the footer is fine. With fire gone from the hero, "Chat and build privately." would also work there.
- The paintings are still the 1672 px sources, upscaled.

## Round 4: wider paintings (`r4/prometheus.html`)

Your note: the figure filled only the right side. Codex made four new canvases by the same painter, each a panorama with something in every third (prompts in its report; files `paintings/wide-*.png`):

1. **Panorama** (default): smaller figure right of centre; the path winds to the valley and dwellings on the left; Olympus far upper right.
2. **Procession**: a diagonal ridge across the whole canvas, the figure small at its middle, wide band of clouds.
3. **Threshold**: a larger figure; the richest left side (trees, river, lit village).
4. **Ultra-wide** (1774 × 887, about 2:1).

On the page the canvas now simply covers the hero (heads sit well below the top edge in all four). The left-hand shade was replaced by a soft local darkening behind the copy, so the left landscape shows, and the bottom fade starts later. Press **A** (or the A button) to switch paintings, or use `?art=1..4`. Phones keep the portrait canvas from round 3.

## Round 5: dither, darker, calmer hero (`r5/prometheus.html`)

| Note | Change |
| --- | --- |
| Try a dithering effect and a darker background. | `tools/dither.mjs` pre-renders each painting as a Bayer 8×8 ordered dither with three levels (no dot, dim dot, brighter dot) after a contrast stretch, shown at about 2 px per dot with `image-rendering: pixelated`. The near-black sky is mostly empty; only the ember keeps the brand orange. 7–15 KB per image. A runtime canvas version was dropped: browsers block reading pixels from images on `file://`. |
| Remove the buttons at the top right. | "Sign in" and "Start chatting" are gone from the nav. The hero buttons remain. |
| Remove "From $0.10". | The micro line reads "No account · No subscription". |
| Hero spacing and typography were poor. | The headline sits on two lines ("Chat and / build privately."), 60 px, tracking −0.035em, leading 1.04. The sub is one line on desktop. Gaps follow a clear scale: 24 px headline→sub, 40 px sub→buttons, 18 px buttons→micro. Micro text is 13 px. A soft dark ellipse sits behind the copy so the dots never fight the text. |

Open: on phones the portrait canvas at dither resolution reads only as a dim figure and the ember. A wide painting cropped to the figure might read better.

## Round 6: no dither, three new scenes (`r6/prometheus.html`)

- The dither is gone: smooth paintings at 32% opacity (round 4 used 42%). Round 5's hero, nav and micro line are kept.
- Three new scenes from Codex (`paintings/scene-*.png`), added to the A switcher as 5–7:
  - **Forge** (`?art=5`): the theft at Hephaestus's forge, as Plato tells it. He draws an ember from banked coals into the stalk. The left is filled with anvils, armour and bellows.
  - **Edge of Olympus** (`?art=6`): seen from behind at the brink, a sea of clouds across the whole width, columns at the right edge. The calmest behind the text.
  - **Clay** (`?art=7`): he shapes humans from clay in a cave. Risk: the lying clay figures can read as bodies.
- Deviations Codex reported: the forge opens onto mountains, the lights below Olympus are warm, and the cave opens onto a landscape.

## Round 7: Prometheus looks at the copy (`r7/prometheus.html`)

Your note: he should look toward the copy. Mirroring would have moved him under the headline, so Codex repainted three scenes with him still on the right and his head turned left (`paintings/gaze-*.png`). Key A switches between them:
1. **Descent** (default): paused on the path, looking down-left toward the valley; his gaze lands on the headline's height. Olympus behind him.
2. **Edge of Olympus**: in profile at the brink, looking left over the clouds; his eye line sits near the nav, above the headline.
3. **Forge**: at the coals, looking left across the forge as if someone is coming.

Codex noted the Olympus ember sits among fennel flowers rather than inside the stalk tip, and the descent stalk's hollow tip is hidden by his hand.

## Privacy section studies (`privacy-ideas/`, Nov 15, 2026)

| File | Note it answered | Verdict |
| --- | --- | --- |
| `index.html` | panel too big for a laptop; explain the enclave better | rejected: too many elements and too much text |
| `r2.html` | max 3–4 elements; new copy | superseded by the scroll idea |
| `r3-scroll.html` | tell it by scroll, step by step | rejected: abstract ("sealed part of the chip", "noise") |
| `r4-concrete.html` | name the technologies | rejected: tech pasted on as chips and labels, copy unchanged |
| `r5-copy.html` | rewrite the copy around the technologies, persuasive | current |

Self-review of r5 (two passes before showing):
1. Step 01 led with "TLS encrypts your message", which every site does. Fixed: lead with where TLS ends (inside the enclave) and contrast with most AI services.
2. Step 03 said "no storage" (imprecise) and "walls off" (vague). Fixed: "no SSH, no disk, no root access. Our engineers can't look inside."
3. Step 04 implied only three providers. Fixed: "the provider you picked, like Anthropic, OpenAI or Google".
4. "Reproducible build" lived only in a visual label. Fixed: moved into the step 05 sentence.
5. One-word orphans in steps 01 and 05. Fixed: `text-wrap: pretty`.
6. Step 02 first listed only model, tokens, time, hiding that PPQ sees the IP. Fixed: the IP is listed, as the app's own privacy panel says.

### Privacy section, built version (`privacy/prometheus.html`, Nov 16, 2026)

The note was: less technical, less text, visual, built for real and polished. The pick was a scroll story over one Codex engraving. One picture keeps the style consistent, and only the camera and a message card move. The engraving was chosen over the matte 3D pair because only in it does the enclave read as a sealed box; in the 3D ones the open chamber looked like an oven.

| Pass | Finding | Fix |
| --- | --- | --- |
| 1 | The picture's black (0,0,0) showed as a darker box on #0c0b0a | `lighten` blend, and a background on the transformed camera layer (a transform isolates blending) |
| 1 | The "PayPerQ" label sat lower than the other two | All labels on one baseline |
| 1 | Step 1's metadata chips wrapped onto two lines | One plain line: "Also visible to us: IP, model, tokens" |
| 1 | Neighbouring objects sliced at the frame edges in steps 1–3 | Camera re-aimed and zoomed (1.45 / 2 / 1.45) |
| 1 | "open-source" broke at the hyphen | Non-breaking hyphen |
| 2 | The track pulse rendered as dashes (`non-scaling-stroke` breaks `pathLength`) | The path is drawn in image pixels, so the dash maps to `pathLength` |
| 2 | Step 2 on phones cut off the top of the server | Lower camera on phones, where the caption sits under the picture |
| 3 | The verifier command broke inside "ppq-private-mode" on phones | Non-breaking hyphens in the displayed text; the Copy button keeps the real command |

### Privacy section, high-tech re-take (Nov 16, 2026)

| Pass | Finding | Fix |
| --- | --- | --- |
| 1 | "PayPerQ" label sat on the orange floor reflection | Labels moved below the reflections, brighter, with a dark halo |
| 1 | Rack slice at the right edge in step 1; laptop and racks at both edges in step 2 | Step 1 camera moved left; step 2 zoom 2 → 2.15 |
| 1 | "Verified" card touched the rack tops | Per-scene card position (`verify: [x, y]`) |
| 2 | Track pulse showed as two pieces mid-run (the dash pattern wrapped) | Gap longer than the path (22/300), offset 22 → −100 |

### Privacy section, scroll-scrubbed (Nov 16, 2026)

| Pass | Finding | Fix |
| --- | --- | --- |
| 1 | The enclave glow washed out the module at step 2 (screen blend over orange glass) | Glow 26% → 20% wide and opacity .85 → .42 |
| 1 | The fold must not go blank (the r10 owner's rule: the first section's top shows under the hero) | Title top-aligned in step 0, nothing hidden or lazy-loaded |

### Privacy section, 3D (Nov 16, 2026)

| Pass | Finding | Fix |
| --- | --- | --- |
| 1 | The canvas background rendered darker than the page after tone mapping, leaving a visible box | `mix-blend-mode: lighten` on the canvas, over an isolated host with the page colour |
| 1 | Platforms read as grey plates | Near-black matte, light rim only |
| 1 | Step 2 flooded the whole server orange | Core light 13 → 5 max, emissive 4.5 → 2 max, bloom 0.85 → 0.6, threshold 0.88 |
| 1 | The core was a flat orange slab | Frosted radial texture as the emissive map |
| 1 | The fibre ran in front of the core inside the server | Fibre hidden between the server's roof and floor; the light still travels through |
| 1 | "Verified" sat above the frame | Placed to the right of the laptop; overview framed lower and wider |
| 1 | Flat feel | Small camera orbit tied to scroll |
| 2 | The card left the frame right after launch | Card y clamped inside the frame |
| 2 | The light's halo was large near the laptop | Packet light 3 → 1.4 |
