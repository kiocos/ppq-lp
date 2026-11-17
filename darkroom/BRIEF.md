# Darkroom safelight — landing page brief

Written 2026-11-13 from a chat with the user. Read all of it before starting.

## The task

Build **one** PayPerQ landing page on the "darkroom safelight" art direction. Then review it critically and iterate **2 more times** (r1 → r2 → r3), keeping each round's files so they can be compared. Follow the user's general landing-page guidance at the bottom of this file in full. The one exception: it asks for 5 pages, but this time the user wants a single page on this direction. Everything else still applies, including 3 font pairings to compare on the page, the app captures, Remotion motion, references, whitespace, and the critique between rounds.

## The art direction

**Darkroom safelight.** A photograph develops in the dark, and stray light ruins it. The safelight is the one warm amber light you can work under without exposing the print. PayPerQ's orange stops being an arbitrary accent and becomes *the light that is safe to work under*.

**The idea underneath: noise as the medium.**
- Encryption turns meaning into noise, and generative AI turns noise into meaning: the same operation in opposite directions.
- Diffusion models literally develop an image out of noise, like a print appearing in the developer tray.
- Claude Shannon published an early statistical model of English in 1948 (word-by-word "approximations to English" that read like gibberish) and proved perfect secrecy in 1949. Language models and modern cryptography share that parent.

So the page is made of grain. Where the user is, the grain resolves into meaning (their chat, their answer). Everywhere else it stays noise. The grain is not decoration; it is the idea.

What this should look like:
- **Star of the show:** the real chat app developing out of grain under an amber safelight glow, made in Remotion from real app footage.
- **Visual rhyme:** the amber light only where there is "life" (CTAs, focus states, the active element). Grain and developing-from-noise transitions recur across the sections. Photographic-lab details only where they carry meaning: exposure or timing marks as numeric rhythm, a print that develops when a section enters the viewport.
- **Depth:** real film grain, the falloff of a safelight glow. Subtle, never competing with the star.
- **Subtle nods (optional, only if natural):** Shannon's 1948 approximation text as a footer easter egg; "nothing leaves the darkroom until it's ready" as a tone, not a slogan.

Darkroom = laboratory = precision. It fits the Jensen-jacket brief: near-black, one light, no fuss.

## Pitfalls specific to this direction

- **Darkroom kitsch:** no red-room horror look, no film-strip clip art, no camera, aperture or lens icons, no "developing…" puns everywhere. Use amber (PPQ orange), not red.
- **Dark must not read clandestine.** It is a professional lab, not hiding. (05 Night was rejected partly because the night-forest theme read as rest/escape and leaned clandestine; see `uniform/r3/05-night.html` and the memory notes.)
- **No landscapes, no human figures.** Hand-drawn figurative SVG is a weak spot.
- The metaphor must stay legible: a visitor should see the safelight and the developing in the first screen, without a caption explaining it.

## Standing constraints from earlier feedback

- Restraint: neutrals plus PPQ orange; short pages. A flashy, multi-colour, long version was rejected.
- Typography: no italic or condensed display serifs for emphasis (Instrument Serif and italic emphasis were rejected as hard to read). Emphasize by colour or opacity in the same upright font.
- Privacy claims must be scoped. The enclave covers specific models; on "Anon" models the upstream provider can still read messages. Never say "invisible". Pair claims with a verification path (attestation / published PCR0, open source).
- The page itself should load no third-party trackers.
- No "vs." table against OpenAI/Anthropic/Google (PPQ resells their models).
- Real logos only. Simple Icons' "Lightning" is Lightning AI, not the Lightning Network; the real network mark is already in `uniform/assets/logos`.
- Logo font: the previous study recommends retiring Orbitron (`uniform/logo-study.html`). Take it into account.
- Facts change: re-fetch `api.ppq.ai/models-pricing` and the published PCR file before reusing any number, and note the date on the page.
- App capture: reuse the persistent guest profile. Fresh browsers create anonymous guest accounts on the live api.ppq.ai; avoid that.

## What already exists (reuse it)

- `uniform/REFERENCES.md`: teardown of Vercel (design.md), Cursor, AI Hero, Command Code and Fonts In Use. Still re-open the references yourself. **If you can't inspect them, say so and stop; don't proceed without looking** (the user's explicit instruction).
- `uniform/app-captures/`: 2× stills (dark/light) and app recordings, including 2880 px masters in `_masters`. Re-record if the darkroom treatment needs different shots.
- `uniform/assets/`: local fonts, real logos, `kit*.css`/`kit.js` (font switcher on key T).
- `uniform/motion/`: Remotion 4 project (Sealed, Wheel, Ledger, OneLine, Night, AppTour with portrait variants).
- `uniform/tools/`: page screenshot and asset-check tools.
- `uniform/README.md` and `uniform/REVIEW.md`: how things were made and what went wrong in the previous rounds.
- Approved copy: "Chat and build privately." and "Your favorite AI models, with privacy you can verify." See the uniform pages for the rest.

Put the new work in `darkroom/` (pages, review notes, motion outputs). Add the new page to `uniform/index.html` or give it its own small hub.

## The user's general guidance (verbatim)

> Let's design a new landing page for PayPerQ, we already tried a few.
> Here's what I have in mind:
> 1. I want a no-fuzz style that communicates stability, business. Function over form, no loud design choice, goal is not to be "super cool", but to communicate efficiency and precision. Think of Jensen Huang: he always wears the same leather jacket, so he doesn't waste his time making outfit decisions, but even though it's always the same jacket, it has some "cool" effect to it. We don't want to be boring.
> 2. Keep a somewhat conventional website structure, we want it to feel familiar so users know where stuff is, but we can break predictability inside the structure, by breaking small patterns or doing something creative or unexpected.
> 3. Human brain can only hold up 3 or 4 things at a time: let's focus on the message we wanna convey. The three main things I want PPQ to be known for is: privacy (especially with the enclave, which is verifiable privacy), many AI models, API access for building and pay per use. We wanna make clear right off the bat that we're an AI company offering models without damaging user's privacy. "Chat and build privately" is the message.
> 4. Use copywriting I already stated I like and go from there.
> 5. Don't use low quality SVGs or make up SVGs, for anything which has a real logo, prefer using the real logo (like Bitcoin, Lightning, etc).
> 6. Inspiration that comes to my mind is Vercel and their design.md https://vercel.com/design.md, https://cursor.com, https://www.aihero.dev/ (these three feel very similar and have the Jensen Huang style I talked about, I like they're functional and stable) and https://commandcode.ai/ (I don't like the use of straight lines and sections defined and separated by lines in this one, but I do like their animations, illustrations, contrast, and unusual choice of colors, it has some personality to it).
> 7. You may look for other inspirations too, and you may bring elements from pop culture that is related to the message we wanna convey and our target audience (privacy oriented people, crypto people, libertarians, cypherpunks). Be careful when doing this though: it should be very subtle and only done when you feel it's a safe move. Don't "try too hard" and end up something obvious like "cypherpunks write code", this bias shouldn't be blatantly obvious otherwise it sounds unnatural.
> 8. Before you begin, look at the references and analyze how they're designed, their spacing, font choice, colors, layout, style of copy, way of communicating, etc. We wanna learn and take what's best from them when making ours.
> 9. Let's experiment with different fonts as well. Geist is one we'd like to use, but let's combine it with font families that would look good too. Don't overdo this though, it's experimentation. If you look at https://fontsinuse.com/in/1/topics/32/technology you may be able to see how other designers combined different fonts, we could retrieve inspiration from it as well. We should not only have different landing pages to compare, but also different font combinations in each to compare. Don't go too crazy choosing different fonts, they could be from different families but must feel right and intentional when putting together. Fonts that are from different families by way too similar doesn't feel intentional. In order for this idea to work well, it's necessary that some contrast between the font exists, they should have slightly different styles.
> 10. Consider the current font used in PPQ's logo: do we wanna keep it? Do we wanna use another font? When choosing the fonts for the landing page, take the logo font into consideration as well, either to make something that goes nice with the logo font or to change the logo font.
> 11. Actually spin up the the Chat APP here in localhost and make some videos / screenshots out of it. The app should look like in use, with some prompts and response from a model. You may the prompts and response, but use actual Chat APP screenshots / videos. They should be high quality and saved in a folder. Small videos showing model picker interactions could be good. I'd like to showcase a bit of the chat app.
> 12. Don't be afraid of white space. I don't want the design to feel too tight, elements and sections should have room to breathe.
> 13. Have some animations / transitions, add them when it makes sense to do so, don't overuse it.
> 14. Don't use very simple SVGs for animation. You may do motion graphics, but use Remotion for creating beautiful motion graphics and integrating it well in the landing page.
>
> Also take advice from this (summary of a "Six Fast Design Wins" web design video the user shared):
> - **Typography, level 3:** pair fonts from different families/foundries that mesh. Start from the headline ("anchor") font, which sets the page's personality and must match the brand; supporting fonts should feel from the same world but add contrast (e.g. condensed vs. wide). Avoid near-identical pairs (Georgia + Times). Use Fonts In Use to find what designers pair with the anchor.
> - **Star of the show:** one thing that makes people feel something and anchors attention. Don't pick it just because it looks cool; it's a seed ("what if…") tied to the product's story, and everything grows around it. Keep it subtle enough not to compete with the text (masking, flipping, toning down).
> - **Visual rhyming:** repeat components of the star (shapes, colours, gradients, textures) across buttons, cards, icons and backgrounds so everything feels from the same universe.
> - **Depth:** textures (noise/grain), glass, 3D elements that make the site feel tangible, but settled: noticed, not asking for attention, never competing with the star.
> - **Opacity hierarchy:** like Material Design (87% high emphasis, 60% medium), keep headlines at 100% and drop subheadings to ~70% so the eye knows what to read first.
> - **Try something totally different:** after the first version, deliberately try a radically different take (light mode, another layout, another star), the way a producer has an artist sing it faster, slower, an octave up. The example in the video went through 12 versions of the same star.
>
> You may design 5 different landing pages, they can be completely different from each other, let's really explore multiple directions, but always following the layed out principles: familiar structure with surprises or unfamiliar stuff in the details + all the things I mentioned before.
>
> After you're done, re-review what was implemented critically and make new versions improving each of the findings. Iterate over the designs at least 2 times.
