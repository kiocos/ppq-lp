# Critical review log

Each round was rendered at 1440 px and 390 px, then reviewed against the brief and the references (Vercel design.md, Cursor, AI Hero, Command Code). The next round fixes every finding listed here.

## Round 1 → Round 2

### Across all five pages

1. **Motion type is too small once embedded.** Sealed was composed at 1920 px and shown at about 1150 px, so its panel subtitles land near 11 px. The browser and provider panels are also empty for most of the loop, and they read as dead boxes.
   *Fix:* rebuild Sealed at 1600 × 820 with larger type and shorter panels. Each panel keeps a trace once the packet has passed: the sent bubble in the browser, a working state at the provider.
2. **The app is shown, but you can't read it.** The full-window recording is legible on a monitor, but at hero size the picker and composer are tiny. The brief asks us to showcase the app.
   *Fix:* a new Remotion piece, AppTour. It plays the real recording (2880 px master) with camera moves: push into the model picker while it filters, follow the composer while the follow-up is typed, then pull back. A short caption names each beat.
3. **Orphaned words in display headlines.** "verify." sits alone on pages 02 and 05, and "task." on page 01.
   *Fix:* `text-wrap: balance` on every display heading, plus per-page measure tweaks.
4. **Secondary text fails contrast.** fg-3 captions measure 3.4–3.9:1 at 13–14 px on several palettes, below AA.
   *Fix:* raise fg-3 on every page to 4.5:1 or more.
5. **Mobile overflow.** On page 03 the verify grid child has no `min-width: 0`. Page 04's five-column price table is wider than 390 px.
   *Fix:* `min-width: 0` on grid children, and horizontal scroll on wide tables.
6. **Tool logos disappear on light.** Goose's mark is white on transparent, so it vanishes on paper.
   *Fix:* invert monochrome-white marks on light pages.
7. **Section silhouettes repeat.** On pages 01 and 05, almost every section is "heading left, paragraph right, media below". Vercel's guide calls this template noise.
   *Fix:* give each section its own composition.
8. **The night backdrop has a visible glitch.** The fire hole's lip renders as a flat dash on the horizon, and the smoke is one pale column.
   *Fix:* remove the lip and keep only light on smoke, made from thinner, drifting wisps.
9. **The receipt starts empty.** For the first second the hero shows a nearly blank slip.
   *Fix:* the loop starts with three lines printed, and the poster is taken late in the loop.
10. **No comparison hub or logo study.** You need to compare the pages, the pairings and the wordmark question.
    *Fix:* add `index.html` (all rounds and pairings) and `logo-study.html`.

### Page by page

- **01 Uniform.** The calmest page and the closest to the Jensen jacket brief. The hero index (four live jump links) is a good small surprise.
  *Problems:* the dark full-window video reads as a black slab at first glance, and "attested" in the hero is jargon.
  *Round 2:* AppTour hero, a plainer hero index, and varied section layouts.
- **02 Wide.** The expanded type has real presence, and the wheel makes the models-and-cost relationship obvious.
  *Problems:* the chat app never appears. "verify." is orphaned. The API section copy ("Build with the same models.") is new and weaker than the approved line.
  *Round 2:* add the app (AppTour, graphite), restore approved copy, and fix the measure.
- **03 Ledger.** The most distinctive in tone; the editorial serif works here.
  *Problems:* "No." over "No email to start" is a double negative. The Orbitron wordmark clashes with the book serif; that's a useful data point for the logo study. Goose's logo is invisible.
  *Round 2:* rephrase the three statements and fix the logos.
- **04 Terminal.** The most personality. The ember bars are data (models per provider), not decoration, so the Command Code influence stays honest. "Don't trust. Verify." is a deliberate, flagged nod to the bitcoin motto; check whether it is too on-the-nose.
  *Problems:* the table overflows on mobile, and only four tools are listed.
  *Round 2:* fix both and tighten the hero.
- **05 Night.** The strongest first impression; Cursor's painting idea, translated.
  *Problems:* the orphaned headline word and the backdrop glitch above. The pricing and API sections look generic next to the hero.
  *Round 2:* new backdrop render, a better measure, and calmer sections.

## Round 2 → Round 3

Round 2 fixed every round-1 finding. AppTour turned out to be the strongest move: at hero size the picker, its search results, privacy labels and the "Served inside the enclave · Verified" line are all readable. What's left:

### Across all five pages

1. **Motion is unreadable on phones.** At 390 px the 16:9 compositions (Sealed, OneLine, the wheel, AppTour) shrink to about a quarter of their size, and their text lands near 5 px. Desktop is fine; mobile is not.
   *Fix:* portrait renders for mobile. SealedTall stacks the four stations vertically, so the packet travels down. WheelTall puts the wheel above its details. AppTour portrait crops the camera tighter around the picker and composer and uses bigger captions. Pages swap renders at 860 px. OneLine falls back to a static code block on phones.
2. **Captions collide with the UI.** In the browse tour, the caption pill covers the picker footer.
   *Fix:* those captions move to the top.
3. **Wide display fonts break Sealed's panel titles.** In Archivo Expanded, "PayPerQ servers" wraps to two lines.
   *Fix:* titles scale down when the display face is expanded.
4. **One claim needs scoping.** "From $0.0023 per message" reads as the floor, but cheaper models exist (GPT-4o-mini's median is $0.0001).
   *Fix:* name the model ("$0.0023 a message on Haiku 5.5").
5. **Every video preloads.** Below-the-fold videos load metadata up front.
   *Fix:* `preload="none"` below the fold; playback still starts when they scroll into view.
6. **Posters show mid-zoom frames.** For reduced-motion users the poster is all they see.
   *Fix:* posters show the most informative moment, the zoomed picker.

### Page by page

- **01 Uniform.** Strong. The hero index wraps oddly on phones.
  *Round 3:* tighter index copy and the portrait tour.
- **02 Wide.** "One chat for every model." takes three lines in the expanded face.
  *Round 3:* a smaller H2 there, and WheelTall on phones.
- **03 Ledger.** The receipt sits small at the top of a tall box, leaving dead space under it.
  *Round 3:* crop the composition to the paper and enlarge it.
- **04 Terminal.** "Open chat" wraps in the mobile nav, and the tool cards are cramped.
  *Round 3:* hide secondary nav items on phones, drop the "guide" labels, and show a static code fallback.
- **05 Night.** The best overall. The caption pill on the floating window is fine on desktop and too small on phones.
  *Round 3:* the portrait tour.

## Round 3 outcome

All round-2 findings are fixed.
- Phones now get portrait motion (SealedTall, WheelTall, three AppTour portrait cuts) and a static code block in place of OneLine.
- Browse-tour captions moved to the top, and wide fonts scale down inside Sealed.
- Prices name their model, below-the-fold videos don't preload, and posters show the zoomed-in moment.
- Checks at 1440 and 390 px: no page overflow on any of the five pages, and no missing local assets (`tools/check-assets.py`).

Known leftovers, for a later round:
- The type switcher button ("Aa") floats over content on phones. It's a study tool and wouldn't ship.
- The receipt in 03 still shows its printer slot; a tighter crop would enlarge the paper further.
- The app's cost tooltip rounds to two decimals, so sub-cent replies read "$0.00". That's a product issue, not a page issue, and worth raising with the team.
