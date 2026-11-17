# PayPerQ landing: 09 Prometheus

## Hero copy convention

Hero titles must not end with a full stop (`.`), in any current or future version, including standalone studies

A landing page themed on Prometheus taking fire from the gods. The current version puts the chat composer in the hero; earlier rounds use classical-style paintings. Listed as card 09 in the shared hub, `../uniform/index.html`; `index.html` here only redirects.

| File | What it is |
| --- | --- |
| `r11/prometheus.html` | Current page. Privacy-rights copy, a centered composer, and an enclave video player with a silent teaser and a 43-second explainer. |
| `r10/prometheus.html` | Round 10. Instrument Sans + Geist, Baroque forge at 85%, continuously scrolling privacy and API stories, and one balance section in Pricing. |
| `r3/prometheus.html` | Round 3. Approved copy ("Chat and build privately."), the descent painting dimmed behind the hero, calm type, flat buttons, PPQ's brand orange. |
| `r2/prometheus.html` | Round 2. "Take the fire.", full-strength painting, ember flicker. |
| `r2/theft.html` | Re-take. "Steal the fire.", the theft painting, serif, paper sections. |
| `r1/prometheus.html` | First round, kept for comparison. |
| `paintings/` | The PNGs as generated (1672 × 941 landscape, 1024 × 1536 portrait, 1254 × 1254 detail). |
| `assets/art/` | Web copies made by `tools/art.mjs`. |
| `REVIEW.md` | Findings per round and what fixed them. |

Earlier studies retain their font and art switchers. Round 10 fixes Instrument Sans + Geist and the Baroque forge at 85%; the T/A controls and query overrides have been removed.

## Round 11: composer in the hero

`r11/prometheus.html` moves the existing composer into a centered hero with only the headline and subtitle. Its copy takes a privacy-rights stance, drawing on Mullvad’s emphasis on personal freedom: “Your thoughts are yours” leads the hero, and the closing section emphasizes freedom to think. Sections have no category labels (“Privacy”, “API”…); each heading is a descriptive title: “Private chats you can verify.”, “One API key for all your AI tools.”, “PayPerQ on iPhone and Android.” and “Pay per message. Nothing monthly.” The SEO title and description follow that direction. The technical privacy explanations, exclusions and model privacy tooltips retain round 12’s qualifications. The composer’s send notice refers to its existing “Open app” link. The forge, hero CTA buttons, microcopy, and duplicate chat introduction remain removed. The Chat navigation link targets the hero composer, and the phone section remains below the API section. Rounds 10 and 12 are preserved.

The composer retains the local model picker, privacy filters, modes, and editable draft. The picker fits the available space above or below the input, and stays out of keyboard navigation while closed. Sending displays a preview notice and a link to the app; this local study does not send a request or transfer the draft. The privacy section now uses the video player described below; the API retains round 10's story layout.

## Round 10: reading and scroll flow

`r10/story.css` and `r10/story.js` leave all explanation text in normal document flow. There are no slide stops, numbered navigation controls, hidden chapters, or scripted scroll jumps. Only the privacy illustration stays sticky; its camera follows the text continuously without holding and advancing by chapter. Each API example has its own illustration beside the copy, alternating sides on desktop and stacking on phones. Its demo plays once on entering the viewport. Reduced motion keeps the privacy camera at discrete poses and disables animation transitions.

The privacy renderer uses `Enclave3D.mount(story, { chapters: true, getProgress })` for smaller camera framings and a stable caption under the model. Other studies keep the original continuous-scroll renderer. Rebuild changes to `enclave3d/main.js` with `cd enclave3d && node build.mjs`; the generated `assets/enclave3d.js` is required for pages opened through `file://`.

The API introduction explicitly identifies the PayPerQ API and its OpenAI-compatible endpoint. The separate API funding block is consolidated into Pricing, with one balance for chat and API, the payment methods, and an **Add balance** link to `/usage`.

## Round 3 (Nov 14, 2026, after your notes)

- **Paintings only in the hero and the closing valley.** The privacy section now shows the app's own privacy panel (`assets/art/app-privacy-pane.webp`, cropped from `../garage/app-captures/chat-privacy-dark.png`, build v0.75.0). The other details were already product: the demo, the code and the price list.
- **Hero copy is the approved PPQ copy:** "Chat and build privately." / "Your favorite AI models, with privacy you can verify." / No account · No subscription · From $0.10. The hero label and the ember flicker are gone.
- **The painting is a background reference:** 42% opacity, slightly desaturated, with a fade into the page.
- **Colour:** PPQ's brand token from the app's theme, `hsl(12 75% 43%)` = `#bf3c1b`, hover `#a8341a`. It fills the primary buttons, the "What PayPerQ sees" card and the $0.10 block, all with white text (5.4:1). The lighter `#e97d49` (the app's `--brand-ink`) appears only as the changed-code text. No orange emphasis in headlines.
- **Buttons:** flat fill, 6 px radius, 44 px tall (34 px in the nav), 15 px medium. No gradient, sheen, arrow chip or glow. The secondary button is a 1 px outline (3:1 against the page).
- **Type:** measured from polarsignals.com, your reference: 48 px regular headline, 18 px body, 44 px buttons with a 6 px radius. Here: hero 52 px Geist Regular, section headings 36 px, body 16–18 px, every display size weight 400. Pairings on key T: Geist Regular · Instrument Sans + Geist · Mona Sans + Geist.
- **Kept as it was (you said the footer is fine):** the closing valley painting, its label and "The fire is yours.", plus the footer.

## Brief

- **Message:** "Chat and build privately", told as the myth: the fire is on Olympus, and you carry it down.
- **Audience:** PPQ's privacy-minded users. They read the fine print.
- **Ideas (4):** privacy you can verify, many models, an API, pay per message.
- **Round 3 brief:** the painting is atmosphere behind the copy, not the message. The copy and the details are PPQ itself.
- **Approved lines reused:** "Your favorite AI models, with privacy you can verify." · "Your chats stay unreadable to us." · "Choose the model for the task." · "Pay per message. Nothing monthly." · "No account / No subscription / From $0.10".

## Who is Prometheus

An earlier round rejected "Prometheus's gift to humanity" because it cast PPQ as the giver. Here the visitor is Prometheus, and PPQ is the fennel stalk: the hollow stalk he hid the ember in to carry it past the gods. That is also the privacy mechanism made visible, so the painting shows a hand cupped around a glow inside the stalk, never a blazing torch. The headline is an imperative ("Take the fire."), and the page ends on "The fire is yours."

## How the star is rhymed

- **Museum labels:** each picture has one. They are the only place the myth is spelled out.
- **The ember:** a slow flicker over the painted ember in the hero; the same warm side-light on the demo panel; lit buttons. Orange marks only what burns or is live.
- **Painted details:** the hand around the ember beside the privacy demo; the valley's first lit homes behind the closing call to action.
- **Canvas tooth:** one grain layer over the whole page.

## Paintings

Made by Codex (GPT-6.1 Terra) with its built-in image tool, in two delegated runs on Nov 14, 2026. The brief asked for 17th-century Baroque tenebrism, a restrained palette with fire as the only saturated colour, and a quiet dark side for the headline. The tool reports its model only as "gpt-image" and has no size setting. The exact prompts, and where each result differs from its prompt, are in `paintings/PROMPTS.md`.

- `hero-descent-a-2.png`: hero of r1 and r2. `hero-descent-portrait.png` is its phone canvas.
- `hero-theft.png` and `hero-theft-portrait.png`: hero of the re-take.
- `detail-stalk.png`: cropped to the hand and stalk for the privacy section.
- `valley-hearths.png` and its portrait: the closing picture. It replaced `valley-fires.png`, whose smoke columns could read as a valley on fire.
- Unused: `hero-descent-a.png`, `hero-descent-b.png`, `hero-descent-portrait-2.png`.

Regenerate the web copies with `cd tools && node art.mjs`. Round 3's hero uses `hero-tall-*.webp` from `node art-tall.mjs`: the descent canvas with 64 px of extra sky on top, so the top edge can fade without touching his head. `node heroshots.mjs ../r3/prometheus.html` captures the first screen at seven viewport sizes.

## Check before publishing

- **Resolution.** The sources are 1672 px wide and the 2400 px files are upscales. They hold up because oil paint is soft, but re-render the chosen canvases at 4K.
- **AI-generated art is labelled** on the hero label and in the footer. Keep or reword it; don't drop it silently.
- **"Take" and "Steal".** PPQ resells the providers' models legitimately. The gods stand for accounts, subscriptions and being watched, not for the labs. "Steal" in the re-take pushes this further.
- **Facts (Nov 14, 2026; re-fetched into `facts/`):** 388 chat models from 66 providers; enclave build v0.75.0; median cost per message Haiku 5.5 $0.0023, GPT-6 Luna $0.0177, Sonnet 5.5 $0.0512, Opus 5.5 $0.1339; "43 messages" = $0.10 / $0.0023.
- **Demo footage** is 08 Direct's: the real app with a written conversation and a staged balance.

## Review tooling

- Scroll regression: `node tools/scrollcheck.mjs` checks native wheel and touch movement, text moving with the document, continuous privacy animation, responsive API rows, reduced motion, and scrolling over the interactive lens in one Chromium browser.
- Captures: `cd tools && OUT=../review node pageshot.mjs ../r3/prometheus.html` (1440 and 390 px; reports overflow, console errors and external requests).
- Assets: `python3 tools/check-assets.py` (run from `tools/`).
- Reference measurements: `node tools/ref-type.mjs <url>` prints computed type, colour and button styles of a page's first screen.
- `tools/node_modules` is a symlink to `../garage/tools/node_modules`.

## Credits

Logos and fonts as in `../garage/README.md`, plus Newsreader (OFL, Production Type).

## Round 8 (Nov 15, 2026): professional fire

The client rejected the half-naked Prometheus in rags ("looks like a beggar"). They asked for options that keep the fire but feel professional. Codex (GPT-6.1 Terra) made 8 images in two delegated runs, saved in `paintings/pro/` with their prompts in `PROMPTS-A.md` (paintings) and `PROMPTS-B.md` (photos). `r8/prometheus.html` is round 7 with these options; key A cycles them, or use `?art=1…9`. The old portrait phone canvas is removed, so phones crop the wide image at 76%. Make `tools/art-pro.mjs` → webp, then `tools/artshots8.mjs` → `review/r8-hero-art*-1440.png` and `review/r8-hero-contact.png`.

1. Prometheus, robed · 2. The study, candlelit · 3. The hearth keeper · 4. Dark lantern · 5. Photo, lantern on the stairs · 6. Photo, flame sealed in glass · 7. Photo, writing by candle · 8. Photo, the craftsman · 9. Before: round 7's descent.

## Round 9 (Nov 15, 2026): the forge in many styles

The client picked round 8's craftsman at the forge, because it reads as builders making something. They asked for the same subject in very different styles. Codex made 12 images in three parallel runs (`paintings/forge/PROMPTS-A/B/C.md`), with the forge photo passed as reference. That reference pulled most results toward the same realistic bearded man. Six weak styles were redone without a reference and with stronger stylization language (`forge2-*`, `PROMPTS-D/E.md`); these are clearly distinct. `r9/prometheus.html` has 15 options on key A (`?art=1…15`); the first version of mid-century, Art Deco, engraving and impressionist is left out. Lesson: don't pass a photo reference when asking for different styles.

Before shipping: the ligne-claire comic (`forge2-graphic-novel`, option 13) looks too much like Tintin, so don't use it as is.

## Privacy section study (Nov 15–16, 2026): the enclave, told by scroll

`privacy/prometheus.html` is round 9's page with a new privacy section. It is kept in its own folder so it doesn't collide with the hero rounds. Open it at `#privacy`.

- **How it works:** the left column has a title and four steps of one line each. On the right, one engraved illustration (`art-enclave/scene-b1.png`, by Codex GPT-6.1 Terra) stays pinned while a camera pans and zooms across it. One message card travels through the scene: it starts plain on your laptop, reaches PayPerQ scrambled (with the metadata we do see), is readable only inside the glowing AWS Nitro Enclave, and reaches the AI provider without your IP. The last step pulls back to "Verified by your browser". On phones the picture is pinned under the nav, with the card as a caption below it.
- **Copy:** "Even we can't read your chats." / "Every chat runs inside an AWS Nitro Enclave. Here's what that means." Steps: "We only see scrambled text." · "It's unscrambled only inside the enclave." · "The AI provider gets your words, never your IP." · "Don't trust us. Your browser checks." TLS, PCR0, the reproducible build and the verifier command live in a closed "Technical details" disclosure, like the app's.
- **Mechanics:** the camera uses registered CSS custom properties (`@property --cx/--cy/--z`) and transitions between steps. Labels are pinned to picture coordinates with `calc()`, so they follow the camera without being scaled. `mix-blend-mode: lighten` lifts the engraving's pure black to the page colour. Reduced motion turns off every transition and the text scramble.
- **Files:** `art-enclave/` holds the three candidates (two matte 3D, one engraving) and `PROMPTS.md`. `tools/enclave-art.mjs` makes `assets/art/enclave-scene*.{webp,jpg}`. Use `tools/ensteps.mjs <page> <prefix> [w h]` to capture each step, `tools/enmid.mjs` for the step-1 transition, and `tools/entech.mjs` for the open details.
- **Check before shipping:** "no one can log into" an enclave is how AWS describes Nitro Enclaves (no interactive access); confirm it with the team. "your IP" stands in for a real address. The picture is 1672 px wide, so re-render it larger for retina at 2× zoom.

## Round 10 (Nov 16, 2026): the baroque forge

The client picked round 9's option 10, the Baroque oil (`paintings/forge/forge-baroque-oil.png`). It was too dark and sat too far right. In `r10/prometheus.html` the canvas is shifted left by `--art-shift` (12%), with its right edge masked into the page. Opacity `--art-op` is .7 (was .32), saturation .92, cropped from the top (`50% 12%`) so his head clears the nav. The copy stays on the canvas's dark left side. Key A compares 70%/12% · 85%/12% · 55%/8% · round 9 as it was. On phones the crop sits at 93% to keep the smith in frame, starting 270 px down below the buttons. Captures: `tools/artshots10.mjs`.

## Chat section in r10 (Nov 16, 2026)

`r10/prometheus.html` (where `index.html` points): the Models section is gone and a Chat section now sits after the API, before Pricing (order: privacy, API, chat, pricing). Nav: Privacy · API · Chat · Pricing.
- **Chat:** "Most AI apps keep your chats. We can't even read them." / "Every major model in one chat. No account needed, nothing monthly." / a working replica of the app's composer with the real 388-model picker and Anon/ZDR/E2EE badges / proof line linking the Enclave Router post. Study: `chat/r2/`.
- **Mobile app panel:** "PayPerQ on your phone.", App Store / Google Play buttons (links are `#` until we have the store URLs; marks from Simple Icons, swap for the official badges), phone showing the mobile web app's new chat.
- New files: `assets/chat-models.js` (model list from `facts/models-pricing.json`), `assets/ppq-icon.png`, `assets/art/app-phone-newchat.webp`. Composer classes that clashed with the page were renamed (`.cproof`, `.mrow`, `.pfoot`).
- Sending is simulated: the live page needs PPQdotAI to open `/chat` with the draft and the chosen model.

### Round 10 review fixes (Nov 16)
- **Composition.** The hero is `100svh − 160px` (600–940 px). The privacy section starts 56 px below it, and its app panel is no longer held back by the reveal, so the panel's top shows above the fold. The painting starts under the nav (`top: 64px`) with a faded top edge, so the smith's head clears the nav.
- **Nav.** "Docs" plus an outlined "Open app" (ppq.ai/chat) on the right. On phones only "Open app" shows. There's no "Log in" because PPQ needs no account.
- **Copy.** The headline breaks as "Chat and build / privately." (`<br>`, no `max-width: 9em`). The subhead "…privacy you can verify." is now full white at 20 px. The micro line is "Pay per query · No account · No subscription" at 15 px in `--fg-2`. The approved headline is unchanged.
- Captures: `tools/artshots10b.mjs` → `review/r10b-hero-{1920,1440,1024,390}.png`, with no overflow or errors.

### Privacy section: high-tech re-take (Nov 16, 2026)

The engraving read as archaic, and the client wants cutting-edge high tech. Codex made a high-tech set with the same composition (`art-enclave/tech-*.png`, prompts under "High-tech set" in `PROMPTS.md`). The page now opens on **H1a, hardware render**: graphite aluminium, smoked glass, a glossy black floor, the enclave as a sealed bolted module glowing behind the glass. Key **S** (or `?scene=1…3`) cycles H1a · H2 luminous wireframe · H3 silicon (the enclave as a chip). Each scene carries its own picture coordinates and camera per step, in the `scenes` table of the privacy script. Web copies come from `node tools/enclave-art.mjs tech-h1a.png h1a`. The engraving (`b1`) stays in `art-enclave/` but is out of the switcher.
- **Headline on one line (Nov 16).** "Chat and build privately." `nowrap` at `clamp(28px, 2.9vw, 44px)`, on phones `clamp(24px, 7.4vw, 32px)`. Measured: it ends before the forge at every width (1920: 44 px, ends at x 827; 1440: 42 px; 390: 29 px), with no overflow.
- **Type scale (Nov 16).** One size per role: 44 for the hero h1, the closing h2 and the $0.10 figure (nothing larger than the hero headline) · 32 for section and app h2 · 18 for the hero sub and big-sub · 17 lead · 16 body · 15 buttons · 14 for nav, labels, the hero micro line and links · 13 captions · 12 tags. Phones: h1 29, closing/$0.10 28, h2 24. Hero gaps: 14 h1→sub, 32 sub→buttons, 16 buttons→micro. Before this, the hero h1 (42) was smaller than the closing h2 (46) and the $0.10 (64), and section h2s were 36. Audit with `node tools/typeaudit.mjs ../r10/prometheus.html [width]`.

### Privacy section: scroll-scrubbed animation, now in r10 (Nov 16, 2026)

The story no longer jumps between steps: scroll position drives it continuously, forward and back. `p` runs from 0 (title) to 4 (verified), and is p = n when step n's centre sits on the reading line (mid-screen; 72% down on phones). A light inertia (`shown += (goal − shown) × 0.16` per frame) makes it glide. Everything else is a function of `p`:
- **Camera and spotlight:** interpolate between the overview and the four held framings. They move slightly ahead of the message.
- **Message card:** it is typed letter by letter at the laptop, then travels in an arc to the server, scrambling left to right with a short noise band at the front. It drops into the enclave and unscrambles there, the card's orange tint rising with it. Then it arcs to the provider, and "your IP not included" appears.
- **Light:** a point of light runs along the fibre with the message. The enclave's glow swells while it holds the message and breathes slowly at rest.
- **Attestation:** a green line scans the server top to bottom, then "Verified by your browser" fades in and its tick draws itself.
- **Reduced motion:** snaps to the four steps, with no inertia.

Built in browser JS and CSS custom properties rather than a Remotion video, because a video can't follow the scroll both ways cheaply (it would need an all-keyframe encode), and HTML keeps the text crisp, selectable and translatable.

It was spliced into `r10/prometheus.html` (the page `index.html` opens) on Nov 16, about 00:47. Only the #privacy section, its CSS block, its phone rules and its JS changed. Nav, hero, art switcher, #api and #chat were checked byte-identical. `privacy/prometheus.html` stays as the study copy with key S. Tools: `tools/enscrub.mjs <page> <prefix> [w h] [p list]` captures fractional positions. `review/video/privacy-scroll-r10.mp4` is a 19 s scroll-through.

## API section in r10 (Nov 16, 2026)

`r10/prometheus.html` now carries the API section from `api/v8.html` (round H): the tool constellation around the PayPerQ flame, four scroll-driven scenes (editor, phone, store with X-ray lens, agent board) and the orange funding bar with crypto icons. Its classes, ids and keyframes are prefixed `ax-` so they can't collide with the other sections; its script is the last `<script>` in the file ("API section script"), and the old code-retype block left a marker comment `// api: …`. It follows the r10 type scale (the h2 uses `.sec h2`, subheads 20, no half sizes) and lines up on the `.wrap` edge. Studies and every round: `api/` (`README.md`, `REVIEW.md`).

### Privacy section: real 3D, vertical, revealed as you scroll (Nov 16, 2026)

The user didn't want a still picture being zoomed. They asked for independent models that appear one by one, top to bottom. The stage is now a three.js scene (`enclave3d/main.js`, bundled by `node enclave3d/build.mjs` into `assets/enclave3d.js`, about 600 KB). It is one classic script, because Chrome blocks ES modules on `file://`. three 0.187 comes from `/Users/kio/shorts-historicos/node_modules`.

- **Models, all built in code:** a laptop (aluminium, keyboard texture, a hinged lid, a screen drawn on a canvas showing the message being typed); PayPerQ's server (graphite shell, smoked-glass front with steel bezel and screws, the enclave module inside: steel frame, frosted glowing core, brackets, bolts, a point light); the provider's racks (four towers with vent faces and LED strips). Each sits on a dark platform with a light rim. Lighting is a RoomEnvironment PMREM, a key light and a cool rim light, with ACES tone mapping and soft bloom.
- **Story, scroll-scrubbed (p 0→4):**
  - 0: only a closed laptop, under the title.
  - 0→1: the lid opens, the screen wakes and the message is typed on it. The fibre draws itself downward and a point of light leaves the laptop. The server rises into view as the camera descends, and the HTML card rides beside the light, scrambling.
  - 1→2: close on the glass. The light enters the server (the fibre is hidden inside it), the enclave brightens and the card unscrambles.
  - 2→3: the light leaves through the floor and the racks rise into view. Their LEDs wake when it arrives, and "your IP not included" appears.
  - 3→4: the camera pulls back to the whole column. A green sheet scans the server, a green pulse runs back up the fibre to the laptop, and "Verified by your browser" appears beside it.

  The camera also orbits slightly with scroll, so the models read as solid.
- **Fallbacks:** without WebGL, the static H1a render shows. With reduced motion, it snaps to the four steps.
- **Files:** `privacy/3d.html` is the study copy. `r10/prometheus.html` got the same stage, spliced at about 01:12 Nov 16 (privacy markup, one CSS block, two phone rules, the mount call, and the bundle's script tag before the main script). Use `tools/enscrub.mjs <page> <prefix> [w h] [p list]` with the SwiftShader flags to capture it.

### Privacy section: "sealed" study, 2D and scroll-revealed (Nov 16, 2026)

The user said the three.js stage felt like AI slop. They liked the encrypting text of `uniform/r3/05-night.html` and the shielded-bitcoin decks' look. `privacy/sealed.html` replaces only the privacy visual of r11 (built from it by `python3 privacy/sealed-parts/build.py [src] [out]`; sources are `privacy/sealed-parts/{visual.html,style.css,script.js}`, so the same parts can be spliced into r11 later). No WebGL, no images.
- **The message is the star.** One card, scroll-scrubbed (p 0→4 from `story.js`, frame-rate-independent glide). It is typed, then encrypted left to right with a noise band, using real AES-GCM bytes from WebCrypto, wrapped to the same columns as the text so each character changes in place.
- **Zones draw themselves in** as the story reaches them: your browser → PayPerQ servers (faint ciphertext drift, metadata chips IP · model · tokens stay readable) → AWS Nitro Enclave (orange wall; each character decrypts as it crosses, with a note: no shell access, no persistent storage, only a vsock link) → re-sealed on the way out (TLS) → AI provider (opens; the IP chip is struck).
- **Verification last, in place:** the user didn't want the camera to climb back to the top. The schematic now fades out where it stands (p 3.1→3.35) and a "Your browser" panel fades in at the same spot (3.35→3.6): the attestation's PCR0 turns green character by character against the published PCR0, then the verdict draws. The copy list has extra bottom padding so the pinned frame doesn't scroll away during this. "Try a modified build" swaps the hash and shows "Doesn't match. Your browser sends nothing."
- **PCR0 shown is the value from the 05 study (`3ef8 468b feaf b866 …`), possibly stale.** Wire it to the live verifier (`ppq-enclave-proxy/lib/nitro/browser-verify.mjs`) before shipping.
- **Both columns pinned (user request):** the copy no longer scrolls. `.sx-pin` sticks while the page scrolls a tall track (height set by the script: one `stepLen` = 80% of the viewport per step, with 12% holds at each end of a step). The left side shows one step at a time and swaps only when the animation arrives at that stage (`ARRIVE = [0, .92, 1.92, 2.92, 3.4]`): the old step slides up and fades, the new one rises in. Five ticks under the copy show where you are. On phones the frame sits on top and the step below, both pinned under the nav.
- Captures: `node tools/sealedshots.mjs <prefix> <w> <h> <raw progress list>` (one unit = one step of scroll) → `review/sticky-*.png`, `review/sticky-390-*.png`, `review/stickyend-*.png`.
- **Objects instead of labels (user request, Nov 16):** the user disliked the plain text and plain lines, and labels like "Your browser". Only the enclave keeps a label. The scene is now one centred column of recognisable objects: a browser window on `ppq.ai` with the chat composer (send button presses as the message leaves); PayPerQ's server, a graphite chassis with the PPQ icon, vents and blinking LEDs, where a scan line sweeps the card and its IP/model/token chips light up (the envelope is read, the letter is not); the enclave as a sealed, screwed, lit bay inside that chassis ("AWS Nitro Enclave", the only label), warming while it holds the message; the provider as a panel of model logos with Claude lit. A point of light with a tail leads the card through faint glass fibres. All side notes are gone, since the left column explains each step. The verification panel is the same browser window: the enclave's PCR0 (orange enclave glyph) against the published one (GitHub mark), "Matches. Safe to send." Previous parts are in `/tmp/encl/*-prev.*` only for this session.

### Privacy section: the film (Nov 16, 2026)

The user wanted the explanation inside the animation, "like a Remotion video that plays forward as we scroll", after Unkey's hero video and the Unicorn Studio relaunch film (one subject on a black stage, a camera that pushes in and pulls out, short sentence-case captions typed in with a scramble at the leading edge, UI overlays like a cursor and mono chips in white boxes). `privacy/film.html` (built from r11 by `python3 privacy/film-parts/build.py`; parts in `privacy/film-parts/`) replaces the whole privacy story with one pinned stage. `sealed.html` stays as the previous study.
- **Timeline t = 0 → 7.2**, one unit = 62% of the viewport of scroll, frame-rate-independent glide, a thin playhead at the bottom.
- **Scenes:** browser close-up, message typed and encrypted (real AES-GCM hex) → wide shot of the journey (browser · PayPerQ server · provider) → server: the request log prints our line with only `IP · model · tokens` readable (white chips), the body redacted → an admin cursor runs `$ ssh enclave` and bounces off the hatched vault wall, "✕ no shell access" → push into the enclave: the message squeezes through the port, letters come back as they cross the wall, warm bloom → pull out to the provider, IP struck → cut, in place, to the browser checking PCR0 (enclave vs GitHub), "Matches the published build. Safe to send.", "Try a modified build".
- **Captions** (the explanation, part of the film): "Encrypted in your browser before it leaves." · "PayPerQ sees the envelope, not the words." · "Our staff can't log in to the enclave." · "Opened only inside an AWS Nitro Enclave." · "The provider gets the prompt, never your IP." · "Your browser checks the enclave's code first." The full step copy stays in a visually hidden list for screen readers; the "Verify the protection" disclosure stays below.
- **Layouts:** wide stage = journey left to right; tall (phones) = top to bottom, with a narrower world so close-ups stay readable.
- Tools: `node tools/filmshots.mjs <prefix> <w> <h> <t list>` (WAIT=ms env for longer settles), `node tools/filmvideo.mjs <name> <w> <h>` → `review/video/<name>.mp4` (scroll-through, `privacy-film.mp4`).
- **Vertical only (user request):** the journey now always runs top to bottom, desktop included (`const wide = false` in `layout()`; the wide code stays for reference). Close-ups are capped at 1.7× so text doesn't blow up on big screens, and the overview shot became a follow shot: the camera travels down with the message from the browser into the server. Video: `review/video/privacy-film-vertical.mp4`.

### Privacy section: a video instead of scroll (Nov 16, 2026)

Integrated into `r11/prometheus.html`. Rebuild R11 after editing `privacy/video-parts/` with `python3 privacy/video-parts/build.py r11/prometheus.html r11/prometheus.html`. Run the builder without arguments to refresh the separate `privacy/video.html` study. R11 retains its current heading, privacy qualifications, and “Check our claims” disclosure; the WebGL renderer and privacy scroll mount are removed.

The user didn't want visitors to have to "get the scroll right". Reference: unicorn.studio, whose hero video plays a different silent loop until you press play. They will add a soundtrack and SFX later, so this is now a real video. `privacy/video.html` (built from r11 by `python3 privacy/video-parts/build.py`) replaces the privacy story with a player. A silent teaser loops in place (paused off-screen; it doesn't autoplay with reduced motion). The play pill ("See how the enclave works · 0:43", centered over the teaser on desktop and phones) swaps in the film with native controls, and when the film ends the teaser returns with "Watch again". Phones (≤700 px) get 4:5 cuts.
- **Remotion project:** `enclave-film/` (its node_modules is a symlink to `uniform/motion/node_modules`). `src/Film.tsx` is the 43 s explainer, `src/Teaser.tsx` the 8 s seamless loop, `src/parts.tsx` the world (browser, server with request log, vault, provider, message, cursor, terminal), `src/lib.tsx` the palette, fonts, grain, scanlines, `CipherGlitch` (slices, an ember channel split, hex blocks: the film's own glitch, meaning encryption) and the scramble-typed `Caption`. `sh render.sh` → `assets/motion/enclave-{film,teaser}{,-tall}.mp4` + teaser posters. `sh stills.sh <comp> <prefix> <seconds…>` for review stills, `npm run studio` to preview.
- **Film:** "You send a message." → "Your words leave your device encrypted." → "PayPerQ relays it." / "Your conversation stays unreadable to us." (log line with white chips) → "Not even our staff can log in to the enclave." (cursor, `$ ssh enclave`, wall flash, "✕ no shell access") → "Decrypted inside isolated hardware." / "Isolated hardware: no logins, no disk." (squeeze through the port, letters return, warm bloom, embers) → "Know what your model provider can see." → cut to the browser: "Your browser checks before sending." / "It matches the public build. Verified." / "A modified build wouldn't match, so nothing is sent." → end card "Chat privacy you can verify."
- **Facts:** real AES-256-GCM ciphertext of the prompts (fixed key and IV so renders are identical). PCR0 is the real current one from `PayPerQ/ppq-enclave-proxy/attestation/published-pcr.json`: v0.79.0, commit d095131, `07cb03ca95c9c68e…` (the earlier studies' `3ef8…` was v0.73.0 and stale). Re-fetch before shipping; it changes with every build.
- **Sound:** no audio yet. Add it in Remotion (`<Audio>` in `Film.tsx`) and re-render, or mux it onto `enclave-film.mp4`. Scene times are in the `CAPS` and `GLITCH` tables in `Film.tsx`, for syncing SFX.
