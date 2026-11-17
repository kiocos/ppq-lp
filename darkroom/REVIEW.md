# Darkroom: critical review log

Each round is rendered at 1440 and 390 px (`tools/pageshot.mjs`, reduced motion, so you see the final states), plus a real-motion pass of the first screen at six moments of the hero video and one print caught mid-development (`tools/foldshots.mjs`). Screens are in `review/`. Each round is reviewed against the brief, the references and the six design wins. The next round fixes every finding listed.

## Round 1 → Round 2

What works: the idea reads. The real chat develops out of amber grain, the typed prompt dissolves back into noise, a noise-filled bubble crosses with only `claude-sonnet-5.5 · 312 tokens · 19:40:12` legible, and the answer develops top-down before colour returns. The four timed steps under the video turn it into a process chart without putting captions inside the frame. The amber appears only on CTAs, the active step, the nav dot and the one line that changes in the code. No errors, and no external requests.

### The star (hero motion)

1. **The undeveloped grain is too loud.** At 0–2 s the frame is a wall of coarse, bright brown noise. It reads as carpet, competes with the headline, and the brief says the depth must never compete with the star.
   *Fix:* a darker field with sparse, finer grain, so the light lives only in the lamp's falloff. Shadows stay near-black, as under a real safelight.
2. **The toning is murky sepia, not a safelight.** `sepia()` lifts blacks to brown, so the app reads as an old photo rather than a lab.
   *Fix:* a true duotone. Grayscale the footage, then multiply it by amber, so black stays black and white becomes amber light.
3. **The seal happens too fast to see.** The words, then the whole UI, vanish within about 1.5 s, which reads as the video breaking. Steps 02 and 03 last 1.5 s each, so the step list can't be read either.
   *Fix:* first only the typed line turns to noise while the composer stays. Hold a beat, then the rest dissolves. Steps 02 and 03 get at least 2.5 s each.
4. **The relay frame is unlabeled and top-heavy.** The metadata floats at the top edge over a large empty field, and nothing in the frame says whose view this is.
   *Fix:* a quiet label in the frame ("What PayPerQ relays"), and the bubble moves into the vertical centre, then glides to where the user's message develops.
5. **The first screen shows too little of the video.** At 1440 × 900 the video starts at about 520 px, so the composer, where development begins, sits at the fold.
   *Fix:* a tighter hero (smaller top padding, the lede beside the H1, CTAs under it), so the video starts near 380 px and the composer develops in view.
6. **Weight.** The hero is 4.0 MB and the phone cut 3.0 MB, because animated grain barely compresses.
   *Fix:* a darker, sparser field (fix 1) plus grain that boils at 6 fps.

### Sections

7. **The privacy section repeats itself and runs tall.** Two tall screenshots of the same panel, both showing "Verified by your browser", sit in mirrored image-and-text rows. That's the identical-silhouette problem design.md warns about, and it adds about 600 px.
   *Fix:* crop the first screenshot to the "Who can see your chat data" table only. Rebuild verification as one evidence move: the published PCR0 next to the PCR0 your browser measured, aligned character for character, with the commands below.
8. **The print effect looks like a loading placeholder.** On entering the viewport, media is hidden under opaque, chunky 3 px orange pixels, with no image visible until it clears.
   *Fix:* finer grain (2 px cells), translucent, so the latent image shows through and gains density, the way a print develops. It runs in 1.2 s.
9. **The PCR line wraps badly** ("Nov / 13, 2026" breaks across lines).
   *Fix:* solved by the PCR0 comparison layout in fix 7.
10. **The picker crop shows debris.** Fragments of the chat behind it ("find", "ery", "k?") show at the right edge.
    *Fix:* re-crop the picker inside its border, with a soft edge.
11. **No product motion outside the hero.** The brief asks for small videos of the model picker, and the models section is a still.
    *Fix:* a second Remotion piece. The real picker recording develops out of grain and then browses, with no captions to go stale.
12. **Two test-strip labels can't be read.** Gemini 4 Argon, GPT-6 Luna and GLM 5.3 sit on mid-grey bands where the text colour flips at the wrong point; Argon's text vanishes.
    *Fix:* text colour switches at a computed luminance threshold, with both sides checked at 4.5:1 or above.
13. **The coin row breaks the palette.** Six full-colour coin logos are the loudest colour below the hero.
    *Fix:* the coins sit in neutral grey and develop into colour on hover or focus, as the provider logos already do (visual rhyme).
14. **Pairing 2 (Archivo Expanded) wraps "Your models can work beyond this chat." onto three lines.**
    *Fix:* a narrower measure check per heading. The sec-head column goes to 7/5 and expanded headings drop one size step.

### Phones (390 px)

15. **Page overflow.** The verification grid's children have no `min-width: 0`, so the code block pushes the page to 570 px.
    *Fix:* `min-width: 0` on every grid child, with code blocks scrolling inside.
16. **The steps are cramped.** Two columns of about 165 px each.
    *Fix:* one column on phones, where only the active step is shown at full strength.
17. **Provider logos wrap 7 + 2.**
    *Fix:* a 5-column grid on phones (2 even rows of 5 and 4, centred).

### Win 6: try something totally different

18. **Every round so far is the same dark page.** The brief also warns that dark must not read as clandestine.
    *Re-take for round 2:* "The print in daylight" (`r2/print.html`). The page is warm paper and the brand stands in daylight. The darkroom is one contained object, the hero tray, where the work develops. The section prints are the light-mode app. It's shown side by side with the dark round 2, so you can choose.

## Round 2 → Round 3

Round 2 fixed all 18 round-1 findings. In the hero: a true duotone (blacks stay black, the UI glows amber), a dark and sparse grain field, and the sealed line kept as one "packet" that travels from the composer to "What PayPerQ relays" and then into the user's message bubble. The steps last 3 s and 3.5 s, and the files are 2.1 MB (wide) and 1.9 MB (phone), down from 4.0 and 3.0. In the sections: the privacy section is one table plus a PCR0 match instead of two screenshots of the same panel. The picker moves. The test-strip labels are readable. Coins and logos develop into colour on hover. The page is 6,741 px tall, down from 7,321. The re-take, `r2/print.html`, is in place. One fix was found while checking: the hero glow (a 1,500 px pseudo-element) widened the page horizontally in round 1. `overflow-x: clip` now contains it.

**Choosing between the dark page and the daylight re-take.** The daylight page is the calmer, more trustworthy read: the brand stands in daylight, and the darkroom is only where the work develops. On paper, though, the safelight loses its magic: light on light is a halo, not a lamp. The dark page is the direction the brief describes ("near-black, one light, no fuss"), it matches the references, and it's where the amber means the most. **Round 3 polishes the dark page as the main direction** and carries the daylight re-take along with the same fixes, so you can still choose.

### Findings

1. **Auto-playing video has no pause control** (WCAG 2.2.2 requires one for motion longer than 5 s). Under reduced motion, the native control bar covers the composer and the enclave line, the most important part of the poster.
   *Fix:* a small pause/play button on each video frame (amber dot while playing), and no native controls. Under reduced motion the poster shows with a play button.
2. **The hero poster causes a flash.** The poster is the final colour frame, but the loop starts in grain, so the page shows the finished app and then cuts to black.
   *Fix:* in motion the poster is the opening grain frame. Under reduced motion it's the finished frame.
3. **The picker still shows debris and a weak poster.** Chat text peeks in at both edges, and the poster lands on the Audio tab, the least relevant moment.
   *Fix:* a tighter crop with a soft dark edge, and the poster on the Kimi search, where the end-to-end encrypted version appears.
4. **The phone hero shows two floating scroll buttons** (↑ ↓) over the composer in the answer state, left over from the capture.
   *Fix:* re-capture the phone answer after the buttons fade, and re-render the phone cut.
5. **"Built to be checked" is unbalanced.** The left column is a short paragraph over empty space, and the right stacks the match and the commands.
   *Fix:* the commands move under the paragraph on the left, and the match sits alone on the right.
6. **The strip header squeezes on phones.** "Median cost…" and "Darker band…" sit side by side in two narrow columns.
   *Fix:* stack them on phones.
7. ~~**The daylight re-take's glow has a hard rectangular edge.**~~ *Misdiagnosed.* The live page has no edge. The "rectangle" only appears in full-page screenshots: the fixed grain overlay covers just the first 900 px viewport in that capture mode, so the paper below it reads 3% lighter. Pixel sampling in round 3 found the jump exactly at y = 900. The glow change made in round 3 (a smaller ellipse) is harmless and was kept.
8. **There's no hub yet** to compare the rounds, takes and pairings.
   *Fix:* the darkroom page joins the shared hub, `uniform/index.html` (card 06), with every round and both takes. Its motion pieces and captures join that hub's sections. `darkroom/index.html` redirects there.

## Round 3 outcome

Round 3 fixed findings 1–6 and 8; finding 7 turned out to be a screenshot artifact (see above).
- Every video has a pause/play control. With motion, the hero opens on its first grain frame, with no flash. Under reduced motion it shows the finished frame and plays nothing until asked.
- The picker sits inside its border, with soft edges and a poster on the encrypted Kimi result.
- The phone hero is re-rendered from a clean answer still.
- The verification block is rebalanced, and the long `gh attestation` command now wraps instead of being clipped.
- The strip header stacks on phones.
- The darkroom page lives in the shared hub, `uniform/index.html` (card 06, plus its motion and captures). `darkroom/index.html` redirects there.

Checks (`tools/pageshot.mjs`, `tools/checks.mjs`):
- 1440 and 390 px on both round-3 pages and all three pairings: no overflow, no console errors, and no requests outside the page folder.
- The step list follows the video: 3 s → 01, 10 s → 02, 13 s → 03, 18 s → 04.
- The pause button pauses, and its label flips to "Play".
- No missing local assets across the hub and all five pages.
- Desktop height: 6,608 px for round 3, against 7,321 for round 1.

Known leftovers, for a later round:
- The type switcher ("Aa") floats over the hero video on phones. It's a study tool and wouldn't ship.
- In the daylight re-take, the hero and the section prints come from different app themes (dark tray, light prints). That's intentional, but it's worth seeing on a real screen before choosing.
- The relay frame's "312 tokens · 19:40:12" is representative, not a real request.
- Staged in the captures: the greeting is pinned to the app's own "Question everything.", and the phone answer still hides the app's two "scroll to previous/next message" buttons with CSS.
- The pricing strip encodes cost as density. Six bands is near the limit; more models would need a real table.
