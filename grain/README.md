# grain — PPQ "cinematic terminal" motion study (Nov 16 2026)

Aesthetic borrowed in spirit (not content) from unkey.com's hero: film grain, mono type, text scramble,
glitch strip cuts, ASCII field, 1px labels, one accent (PPQ #bf3c1b / ink #e97d49).

Visual grammar (the point of the piece):
- grain surface = a place where plaintext exists (your device, the AWS Nitro Enclave)
- base64 ASCII field = ciphertext in transit / on PPQ's host
- light "selection" block = readable text; orange = the enclave and the attestation match only

Scenes (30 fps, 474 frames): you -> TLS -> host sees ciphertext + metadata -> decrypted inside the enclave
-> running PCR0 == published PCR0 (v0.79.0, Sigstore) -> CHAT AND BUILD / PRIVATELY.

Facts: PCR0 07cb03ca…7cc069a5 from PayPerQ/ppq-enclave-proxy attestation/published-pcr.json (v0.79.0, 2026-11-16).
Changes often — re-fetch before shipping. Metadata values (tokens 412) are staged.

Render: cd motion && npx remotion render src/index.ts Hero out/hero-r1.mp4 --codec=h264 --crf=16
(node_modules is a symlink to ../../uniform/motion/node_modules)
