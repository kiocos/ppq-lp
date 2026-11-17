#!/bin/zsh
# Round 2 motion assets (suffix 2 keeps round 1 files intact)
cd "$(dirname "$0")"
OUT=../assets/motion
r() { # comp name props poster-second
  npx remotion render src/index.ts $1 $OUT/$2.mp4 --props=$3 --crf=19 --log=error && \
  ffmpeg -loglevel error -y -ss ${4:-4} -i $OUT/$2.mp4 -frames:v 1 -q:v 3 $OUT/$2-poster.jpg && echo "done $2"
}
r TourSearch tour-search '{"cut":"search","palette":"ink"}' 3.6
r TourBrowse tour-browse '{"cut":"browse","palette":"ink"}' 4
r TourVerify tour-verify '{"cut":"verify","palette":"ink"}' 4
for pal in ink graphite paper amber night; do r Sealed sealed2-$pal "{\"palette\":\"$pal\"}" 5; done
r Night night2-fire '{}' 6
r Ledger ledger2-paper '{"palette":"paper"}' 11
