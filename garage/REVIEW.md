# Garage page: critical review log

Each round is rendered at 1440 px and 390 px (full page, plus one capture per viewport while scrolling, in `review/`), checked against `~/.claude/skills/ppq-landing-design/references/review-checklist.md`, and every finding gets a fix in the next round. Earlier rounds stay untouched for comparison.

## Before round 1: hero mocks

Rendered four hero-only mocks at 1440 × 900 (`motion/out/mock/`), all with the real headline, CTAs and logo row:

- **A, full-bleed door.** The door fills the screen and the light runs edge to edge. Without jambs it reads as a dark wall with lines, the panel seams run through the headline, and the lower half turns brown.
- **B, framed door, centred.** Unmistakably a garage door in under three seconds: jambs, header, sections, the strip and the floor spill. The headline sits on the wall above it like signage. **Chosen.**
- **C, close crop.** Big sections and a thick strip; the whole screen turns orange-brown and reads like wood panelling.
- **D, A in Big Shoulders.** Taller and narrower than Barlow Condensed; it reads as municipal signage rather than a workshop, and lowercase gets cramped. Dropped from the pairings.

## Round 1 → Round 2

Round 1: `r1/garage.html`. Captures: `review/r1-garage-*`.

### What works

- The door reads without a caption, and the strip under it is the strongest thing on the page. The passing shadow (someone moving inside) makes it feel occupied, not abandoned.
- The roll-up pays the hero off with the real chat, which is readable once the camera is in: the picker filtering to Sonnet 5.5, then the composer's "Served inside PayPerQ's secure enclave router · Verified".
- The light edge rhymes cleanly across the lock card, the code window, the price cards, the active nav item, the ghost button hover and the caption cards in the videos.
- Barlow Condensed is the right anchor. In place, the headline is about as wide as the door, like a sign over a workshop. Archivo Expanded (pairing 2) wraps to two lines and pushes the door off the first screen; Geist (pairing 3) is clean but anonymous.
- Contrast: body #f2eee8 at 17.1:1, secondary #aaa49b at 8.0:1, tertiary #8a847b at 5.3:1 on the page and 5.0:1 on panels. Amber link text is 9.5:1; ink on the amber button is 6.6:1.

### Findings and fixes

1. **The video's rectangle shows.** In the hero and the roll-up you can see the edge of the video frame: a lighter band above the door and vertical streaks at the sides. The rendered wall carries grain that h.264 smears into stripes, and its black level doesn't match the page.
   *Fix:* render the wall flat in the page colour (no grain in the video), mask all four edges of every stage video, and move the grain to one page-wide overlay so the texture is the same everywhere.
2. **The hero is cramped vertically.** The CTAs nearly touch the door header, and the micro line sits at the very bottom of the first screen (it falls off with pairing 2).
   *Fix:* put the micro line under the CTAs, place the stage below the copy with a real gap, size the door so header, strip and logo row all fit in 900 px, and put the logo row on the floor inside the stage.
3. **Colour logos on the amber floor are noisy.** Meta blue, Mistral orange and Qwen violet compete with the light, and the page loses its single accent.
   *Fix:* monochrome logos in the hero row (real marks, rendered in the page's off-white at 70 %). Colour returns on hover.
4. **Two closed doors in a row.** The roll-up starts with another closed door just after the hero's closed door, so for 1.5 s nothing new happens.
   *Fix:* the roll-up starts rising at once (from frame 8) and is up by about 2.3 s.
5. **Wrong claim in the models caption.** It says each slot shows the median for the provider's "most-used model", but Anthropic showed Sonnet 5.5 (Opus 5.5 has more messages), OpenAI showed GPT-6 Luna (GPT-4o-mini has the most), and Tinfoil showed GPT-OSS 120B (its private DeepSeek V4.1 Flash has the most).
   *Fix:* show the actual most-messaged model per provider (Opus 5.5 $0.1339, GPT-4o-mini $0.0001, DeepSeek V4.1 Flash private $0.0178), and say how "most-used" is measured (number of messages in the catalogue's median sample).
6. **The pegboard reads as a card grid.** Filled cards with an outline look like any feature grid; the "tool shadow" idea is lost.
   *Fix:* no card fill. Each maker hangs directly on the perforated board inside a dashed outline (the shadow), which lights amber on hover. Tinfoil's label shortens to "6 models · E2EE" so the slots align.
7. **Every section has the same silhouette.** Heading left, amber dash, paragraph, then a grid, four times.
   *Fix:* vary the compositions. Privacy: split head (heading left, text right). Models: centred head over the board. API: heading and tools in one column, the code window beside them. Pricing: the cards first, then the wallet line.
8. **The close breaks between sentences badly.** "More choice in AI. More / control over how you use it."
   *Fix:* one sentence per line.
9. **The half-open door's floor is a flat slab.** The spill is a rectangle of even light that runs off the bottom.
   *Fix:* the spill fans out with distance (a trapezoid, as light from an opening does) and falls off sooner; the image gets masked edges like the other stages.
10. **Phone overflow.** The PCR0 grid (8 columns) runs past 390 px.
    *Fix:* 4 columns under 520 px.
11. **Hidden videos still load.** The desktop hero video has `preload="auto"`, so phones download it while it's hidden.
    *Fix:* every video is `preload="none"`; the kit starts the one that is actually visible.
12. **The table's row labels crowd the values.** "Message contents kept afterwards" runs into "No" at 1440.
    *Fix:* regular-weight row labels and a fixed label column.
13. **Small orphans on phones.** "Know what your model provider can / see".
    *Fix:* `text-wrap: balance` on h3s too.
14. **No depth outside the videos.** The brief asks for grain and a floor reflection as the depth; the page chrome is flat.
    *Fix:* a page-wide static grain (see 1), plus a faint reflection under the lit cards.
15. **Price cards stack one per row on phones**, which makes the section long.
    *Fix:* 2 × 2 down to 360 px.

### Re-take for round 2 (win 6)

The door page is literal. Round 2 also builds a genuinely different take, **Threshold**: no door drawn at all. The first screen *is* the door, dark and type-led with a left-aligned headline, and its bottom edge is the strip of light. Below the strip is the inside: the real chat, lit from the threshold. Same copy and facts, a different star (light only), and a different layout (asymmetric, with the four ideas as a hero index).

## Round 2 → Round 3

Round 2: `r2/garage.html` (door) and `r2/threshold.html` (the re-take). Captures: `review/r2-*`.

### Door: what round 2 fixed

All 15 round-1 findings are fixed. The stage videos no longer show a rectangle (flat wall in the page colour, all edges masked, one page-wide grain). The micro line sits under the CTAs, and the door, strip and makers fit the first screen at 1440 × 900. Hero logos are monochrome, so amber is the only colour above the fold. The roll-up opens straight away. The models caption now matches the data (Opus 5.5, GPT-4o-mini, Tinfoil's private DeepSeek V4.1 Flash). The pegboard slots are dashed shadows with no fill. The privacy, models and API sections each have their own composition. The close breaks by sentence, and the half-open door throws a trapezoid of light. No overflow at 390 px. Price cards sit 2 × 2 on phones.

### Threshold re-take: verdict

Taking the door away tests whether the light alone carries the idea. It **doesn't**, for three reasons:

- A line of light reads as a light, not as a closed door. Without the door the "somebody is building something behind it" story is gone, and the strip becomes a nice divider.
- The first screen loses the star. At 1440 × 900 the strip sits below the fold (the hero is a full viewport of type), so the first impression is a plain dark page.
- The type-led hero with an index is close to Uniform 01, a direction the user has already seen.

What it does better, and what the door page takes from it:
- The **models ledger** (two columns of rows with the cost right-aligned) reads faster than the pegboard and is honest about "most-used".
- The **one-line tool row** under the code is calmer than the six-row list.
- The **full-width code window** with the light under it is the clearest picture of "same door".
- The **pricing table** carries six models with "good for" in the space of four cards.

**Recommendation:** keep the door. Round 3 polishes the door page and brings these four parts over where they fit. The pegboard stays (it's the brief's surprise for that section), but takes the ledger's cost alignment. Threshold stays in `r2/` for comparison and isn't developed further.

### Door: findings and fixes for round 3

1. **The roll-up reads small at the start.** Its first frames show the whole door at about 60 % of the content width, smaller than the hero door just above, so it feels like a step back.
   *Fix:* the roll-up starts closer (scale 1.18, the door filling the frame) and pulls in to the chat from there.
2. **The roll-up's caption pill covers the code.** At 1440 the "Pick from 388 chat models" pill sits over the code block for its first 10 frames.
   *Fix:* the caption sits outside the picker area (bottom left), in the same place for all three beats.
3. **The pegboard still repeats a grid silhouette after the stats row.** Four big numbers, then ten equal slots, read as two grids in a row.
   *Fix:* merge the stats into the section head as one line ("388 chat models from 66 providers. 172 open-weight, plus 96 for image, video and audio."), so the board is the only grid. The slots take the ledger's alignment: name and count on top, model and cost on one baseline.
4. **The API section is a code card plus a long list.** The six-row tool list makes the left column twice the height of the code, leaving a dead area under the code.
   *Fix:* Threshold's layout: heading and lead in a split head, a full-width code window with the light under it, then one row of tool logos.
5. **The pricing cards duplicate the models section.** The board already shows per-model costs; four big cards repeat the idea at equal weight.
   *Fix:* the four lit cards stay (they're the brief's surprise for pricing) but carry the payment story too. The wallet line moves up beside the toggle, and the coins sit under the cards as one row. One composition instead of two blocks.
6. **The hero door's top edge is soft but visible at 1440.** The door header is a dark band slightly lighter than the page.
   *Fix:* the header and jambs fade into the page above two thirds of the door's height (masked in the composition, not just at the frame edge), so the door emerges from the dark and only the lit part is crisp.
7. **The privacy lock card and the verify video don't line up.** The card is taller than the video, so the video floats.
   *Fix:* align both to the top and give the video column the who-can-see table directly under it (Threshold's arrangement), with the provider labels as a three-column row below.
8. **"Built to be checked" repeats what the section lead says.**
   *Fix:* shorten the card text to one sentence that adds the new fact: "Your browser checks this measurement before it sends anything. Run the same check yourself:".
9. **Phone hero: the makers row wraps to two lines and touches the strip.**
   *Fix:* on phones, show six marks in one row plus "+60" in text.
10. **The closing door image is a still, while the hero moves.** It's fine (the brief keeps motion sparing), but the image is cut hard at the top on phones.
    *Fix:* keep it still, and fade the top edge the same way as the hero (finding 6).
11. **The type switcher overlaps content on phones.** It's a study tool.
    *Fix:* label hidden on phones (already), and the button moves up when the page reaches the footer.

### Threshold: issues noted (not carried forward)

The strip is below the fold at 1440 × 900. The PCR0 block overflows at 390 px (`.priv` children lack `min-width: 0`). The closing strip overlaps the footer. These are recorded here for completeness; the direction isn't developed further.

## Round 3 outcome

Round 3: `r3/garage.html`. Captures: `review/r3-*`. All eleven round-2 door findings are fixed:

- The roll-up starts close, with the door filling the frame, and the picker captions sit in the empty left margin, clear of the UI.
- The hero and closing doors fade into the dark at the top, so only the lit lower part is crisp.
- The stats are one line in the models head, so the pegboard is the section's only grid. Slots put model and cost on one baseline (stacked on phones).
- API: split head, a full-width code window with the light under it, and one row of tools (taken from Threshold).
- Pricing is one composition: the wallet line and the USD/sats toggle beside the heading, the lit cards, then the coins and the caption on one row.
- Privacy: the lock card and the verify video align at the top, the who-can-see table sits under the video, and the provider labels form a three-column row.
- On phones the makers row shows six marks plus "+60 more", and the type switcher lifts when the footer is in view.

Two fixes beyond the review:
- **Restructuring regressions caught in the first round-3 capture:** the who-can-see table had vanished, the code examples lost their indentation, and the pricing side column wrapped under the heading. All three are fixed.
- **The Python example called `os.environ` without `import os`** (carried over from the earlier studies). Fixed here; the earlier rounds are left as they were.

Checks: no page overflow at 1440 or 390 px, no console errors, no external requests (the capture script flags any non-file request), and no missing local assets (`tools/check-assets.py`, 5 pages).

Known leftovers:
- **Pairing 2 (Archivo Expanded)** sets the headline on two lines, which pushes the makers row about 20 px below the first screen at 1440 × 900. Pairing 1 is the recommendation; if pairing 2 is chosen, its hero needs a smaller stage.
- **The search footage is from earlier on Nov 13** (uniform study), so the composer reads "Claude Opus 5.5" before switching. It's the real app, but it was recorded before the enclave rolled to v0.75.0. Nothing in that clip shows a build number, so it stays accurate.
- **Type switcher ("Aa")** is a study tool and wouldn't ship.
