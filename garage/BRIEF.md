# Garage door: page brief (main ppq.ai landing page)

Written 2026-11-13. The general design principles and process come from the **ppq-landing-design** skill; this file holds only what is specific to this page.

## The page

- **Product:** PayPerQ (ppq.ai), the main landing page.
- **Message:** "Chat and build privately." Make it clear in the first screen that PPQ is an AI company offering models without damaging the user's privacy.
- **The 4 ideas, no more:**
  1. Verifiable privacy (the enclave);
  2. many AI models;
  3. API access for building;
  4. pay per use.
- **Approved copy:** "Chat and build privately." and "Your favorite AI models, with privacy you can verify." Reuse lines the user approved in earlier rounds; see `uniform/r3/*.html` and `cypherpunk/v2.html` (the accepted v2 direction). Build from them; don't invent a new voice.
- **Audience:** the skill's default (privacy, crypto, libertarian, cypherpunk; mostly men aged 25–40).
- **Logo:** the wordmark is in Orbitron. Consider it (the previous study, `uniform/logo-study.html`, recommends retiring it).

## The art direction (chosen by the user)

**The garage door.** You're building something nobody has seen yet, the door is down, and there is a strip of light under it. The garage is the origin story of tech. Emotion: focus, pride, anticipation. A closed door with amber light under it, no figures, no landscape. It is a direct picture of "Chat and build privately", and the amber is PPQ's orange, used as the light.

The plan the user saw and liked (a starting point, not a cage):

- **Star:** a large dark door face (grain, a brushed or panel texture) with a thin strip of amber light under it, spilling onto the floor. The headline is above it, and a thin row of real model logos below it, so the first screen also reads as "AI company". The light flickers very slightly, as if someone were working inside. "Start chatting" rolls the door up and reveals the real app, lit amber (Remotion, real app footage).
- **Rhyme:**
  - the thin amber light edge under section headings, the active nav item, focused inputs and the bottom edge of cards (each card is a door with light behind it);
  - amber only where something is alive, cold graphite everywhere else;
  - the roll-up as the one motion verb, used sparingly;
  - grain and a floor reflection as the depth.
- **Structure (familiar, one surprise each):**

  | Section | Surprise |
  |---|---|
  | Nav | none |
  | Hero | the door rolls up |
  | Privacy ("behind the door") | you can check the lock: verification panel, build fingerprint, open source, the re-verify recording |
  | Models | a garage pegboard, real logos in dotted slots like a tool shadow board, each with its median cost |
  | API | "same door": the code window has the same light edge |
  | Pricing | cost cards that leak light under their bottom edge, a USD/sats toggle, payment logos |
  | Final CTA | the door halfway up, light spilling out |

- **Type ideas to test:** Geist + Geist Mono, Archivo Expanded + Geist, and a condensed industrial grotesk (Barlow Condensed or Big Shoulders) + Geist. Upright only.

Risks to watch:
- **Garage kitsch:** no oil stains, no drawn tools, no cars.
- **The closed door reading as hiding:** the warm, working light and the verification panel should keep it a workshop, not a hideout.
- **Privacy claims:** scope them.

The skill's "totally different re-take" applies here too: at least one round should try a genuinely different take on the door (for example, light-only with no door drawn, or a light mode).

## Existing material to reuse

- `uniform/README.md`: facts with sources (dated Nov 13, 2026; re-fetch before use), how the captures and motion were made.
- `uniform/REFERENCES.md`: teardown of Vercel, Cursor, AI Hero, Command Code and Fonts In Use. Re-open the references yourself as the skill requires.
- `uniform/app-captures/` (2× stills, 2880 px masters), `uniform/assets/` (fonts, real logos, kit CSS/JS with the T-key font switcher), `uniform/motion/` (Remotion 4: AppTour, Sealed, Wheel…), `uniform/tools/` (app capture, page screenshots, asset check).
- A sibling direction, "darkroom safelight", may be in progress in `darkroom/`. Don't edit its files.

## Output

Put everything in `garage/` (pages per round, `REVIEW.md`, motion outputs, a small hub `index.html`). Final summary to the user in Portuguese.
