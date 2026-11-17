#!/bin/sh
# Renders the enclave film and its silent teaser loop (16:9 and 4:5) into ../assets/motion/, plus posters.
cd "$(dirname "$0")"
OUT=../assets/motion
r() { npx remotion render src/index.ts $1 $OUT/$2.mp4 --crf=$3 --log=error && echo "done $2"; }
r EnclaveTeaser enclave-teaser 24
# 4:5 loop on the landing (latest/index.html): the cipher mosaic. The old ember loop is still EnclaveTeaserTall in Teaser.tsx;
# the 16:9 enclave-teaser.mp4 above is that old loop, used only by the privacy/ studies.
r EnclaveMosaicTall enclave-teaser-tall 24
# the 51 s film (with soundtrack, public/soundtrack.wav) in the cipher-mosaic style (MosaicFilm.tsx); the earlier ember film is still EnclaveFilm / EnclaveFilmTall in Film.tsx
# the mosaic texture is costly to encode: render near-lossless, then re-encode with x264 slower (half the size, same look)
f() { npx remotion render src/index.ts $1 out/$2-master.mp4 --crf=16 --log=error && ffmpeg -loglevel error -y -i out/$2-master.mp4 -c:v libx264 -preset slower -crf 25 -tune animation -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k $OUT/$2.mp4 && rm out/$2-master.mp4 && echo "done $2"; }
f EnclaveMosaicFilm enclave-film
f EnclaveMosaicFilmTall enclave-film-tall
ffmpeg -loglevel error -y -ss 1.8 -i $OUT/enclave-teaser.mp4 -frames:v 1 -q:v 3 $OUT/enclave-teaser-poster.jpg
ffmpeg -loglevel error -y -ss 3.2 -i $OUT/enclave-teaser-tall.mp4 -frames:v 1 -q:v 3 $OUT/enclave-teaser-tall-poster.jpg
echo "all done"
