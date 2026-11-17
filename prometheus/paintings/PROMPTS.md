# Prompts for the paintings

Generated on Nov 14, 2026 by Codex (GPT-6.1 Terra) with its built-in `image_gen` tool. The tool reports its model only as "gpt-image" and exposes no size setting: landscape came out at 1672 × 941, portrait at 1024 × 1536, the detail at 1254 × 1254.

## First set

Every scene prompt was followed by this suffix:

> A museum photograph of a real 17th-century Baroque old-master oil painting on canvas, in the manner of Rubens, Ribera and Jan Cossiers, visible brushwork, glazing and soft craquelure. Restrained deep umber, near-black, cold desaturated Prussian-blue night sky and muted earth tones. Fire is the only saturated colour, warm orange near #f0743f, illuminating face, chest and forearm from below. Prometheus is one strong adult bearded man with heroic classical anatomy, a dull earth-coloured draped cloak, dignified and purposeful, anatomically correct hands. No text, lettering, signature, watermark, frame, border, eagle, chains or punishment; no digital art, fantasy concept art, 3D, engraving or cartoon. Edge-to-edge canvas. Generate at the largest available resolution.

**`hero-descent-a.png` and `hero-descent-a-2.png`** (same prompt; the second began "second candidate:". Codex could not say which file came from which run.)

> Landscape 16:9 landing page hero. Prometheus mid-stride descending a steep rocky mountain at night, in the RIGHT third, three-quarter to full length. He conceals a small ember inside the hollow tip of a pale green-brown jointed giant-fennel cane, cupping it with his hand and cloak; it glows inside, not a torch. He glances back over his shoulder to a small distant pale-gold break in clouds at top right, Olympus. LEFT 55–60% quiet very dark low-detail night sky and deep valley with a few barely visible tiny cold dwellings, suitable for white headline.

**`hero-descent-b.png`**

> Landscape 16:9 landing page hero, different composition: a distant Prometheus about 40% of image height stands lower right on a mountain ledge at night, looking back toward tiny pale-gold Olympus in the top-right cloud break. More sky and landscape. He conceals a small ember inside the hollow tip of a pale green-brown jointed giant-fennel cane, cupping it with hand and cloak; glowing inside, not a torch. LEFT 55–60% quiet very dark low-detail sky and valley, a few barely visible cold dwellings, for white headline.

**`hero-theft.png`**

> Landscape 16:9 landing page hero: the theft on a cloud-wrapped summit at night. Crouching watchful Prometheus reaches the tip of a pale green-brown jointed hollow giant-fennel stalk into a wide bronze brazier with a low fire to light the concealed ember. Figure and hearth occupy RIGHT 45%. Far behind, small soft gods recline at a feast with backs turned, in faint pale gold. LEFT side dark quiet clouds and night sky for headline.

**`hero-descent-portrait.png` and `hero-descent-portrait-2.png`** (same prompt; pairing uncertain as above)

> Portrait 2:3 or 9:16 phone landing page hero. Prometheus descending a steep rocky mountain at night in LOWER half, glancing over his shoulder toward tiny distant pale-gold Olympus glow in a top corner. UPPER 45% quiet dark night sky for white text. He conceals a small ember inside the hollow tip of a pale green-brown jointed giant-fennel cane, cupping it with hand and cloak; glow inside, not a torch.

**`valley-fires.png`** (replaced by `valley-hearths.png`)

> Landscape 16:9 or wider landing page image: dark valley seen from above at night, dotted with many small hearth fires spreading into the distance. Near foreground a few people seen from behind gather around one fire; one lights a second torch from it. No Prometheus. Upper half dark sky and mountains for text.

**`detail-stalk.png`**

> Square close detail of an oil painting: a man's forearm and anatomically correct hand cupped around the tip of a pale green-brown jointed hollow giant-fennel stalk, tiny orange ember glowing inside the hollow, light leaking between fingers onto dull earth-coloured cloak. Dark background, visible brushwork and craquelure.

## Second set

These passed existing paintings as references: `hero-descent-a-2.png` for style, plus the scene being recomposed.

**`hero-theft-portrait.png`**

> Create a new portrait 2:3 landing-page oil painting at the largest available resolution. Use the first reference for the painterly style, palette and Prometheus's appearance, and the second reference for the theft scene. On a cloud-wrapped summit at night, a strong bearded Prometheus in a dull earth-colored cloak crouches watchfully and reaches the tip of a tall fennel stalk into a wide bronze hearth of the gods to light it. Figure and hearth fill the lower 58% of the canvas; the upper 42% is quiet dark night cloud and sky with low detail for a headline. In one upper corner, the gods recline at a feast with backs turned, very small and soft, lit pale gold. A real 17th-century Baroque old-master oil painting on canvas in the manner of Rubens, Ribera and Jan Cossiers, museum photograph, visible brushwork, glazing and soft craquelure. Deep umber and near-black shadows, cold desaturated Prussian-blue night, muted earth flesh, rock and cloth; fire is the only saturated color, warm orange close to #f0743f. Anatomically correct hands and limbs. No text, lettering, signature, watermark, frame or border; edge-to-edge canvas. Not digital art, fantasy concept art, 3D or engraving.

**`valley-hearths.png`**

> Create a new wide landscape 16:9 or closest available ratio landing-page oil painting at the largest available resolution. Use the first reference for painterly style and palette, and the second for the valley setting, but replace its dangerous-looking fires with a calm settled valley. At night from a hillside, show a wide river valley with dozens of tiny steady warm points of firelight: hearths glowing in doorways of small stone dwellings and a few small campfires ringed with stones, scattered along the river into the distance. Homes are lit for the first time. No smoke columns, no burning buildings, fields or trees, no large flames or wildfire. Only in the lower third, a few modest-sized ordinary clothed people seen from behind sit around one small contained fire, and one lights a torch from it; no dominant heroic nude. Upper 45% dark low-detail sky and mountain ridge for a centered headline. (Then the same style paragraph as `hero-theft-portrait.png`, from "A real 17th-century Baroque old-master oil painting" onward.)

**`valley-hearths-portrait.png`**

> Create a new portrait 2:3 landing-page oil painting at the largest available resolution, the same scene as the first reference recomposed for a phone. Use both references for the painterly style and palette. A peaceful wide river valley at night, seen from a hillside: dozens of tiny steady warm points of firelight are hearths glowing in doorways of small stone dwellings and a few small campfires ringed with stones, scattered along the river into the distance. Homes are lit for the first time, calm and settled. No smoke columns, no burning buildings, fields or trees, no large flames or wildfire. Upper 40% is dark low-detail sky and mountain ridge for a headline; the valley's points of firelight occupy the middle; in the bottom quarter a few modest-sized ordinary clothed people seen from behind sit around one small contained stone-ringed fire, and one lights a torch from it; no dominant heroic nude. (Then the same style paragraph.)

## Where the results differ from the prompts

- `hero-descent-b.png`: the figure is much larger than 40% of the canvas height.
- `hero-theft.png`: the feast sits across the upper middle, not a far corner, and the brazier reaches toward the centre.
- `valley-fires.png`: a prominent bearded man who could be read as Prometheus.
- `detail-stalk.png`: includes his face; the page crops to the hand and stalk.
- Portraits: Olympus sits below the top corner.
- Both hearth valleys: the torch is already alight, not being lit from the fire.
