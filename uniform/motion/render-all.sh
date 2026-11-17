#!/bin/zsh
# Render every motion variant used by the landing pages, then make posters
cd "$(dirname "$0")"
OUT=../assets/motion
jobs=(
  "Sealed sealed-ink ink" "Sealed sealed-graphite graphite" "Sealed sealed-paper paper" "Sealed sealed-amber amber" "Sealed sealed-night night"
  "Wheel wheel-graphite graphite" "Wheel wheel-night night" "Wheel wheel-paper paper" "Wheel wheel-ink ink"
  "Ledger ledger-paper paper"
  "OneLine oneline-amber amber" "OneLine oneline-graphite graphite" "OneLine oneline-ink ink"
  "Night night-fire none"
)
for j in "${jobs[@]}"; do
  parts=(${=j}); comp=$parts[1]; name=$parts[2]; pal=$parts[3]
  if [[ -f $OUT/$name.mp4 && "$FORCE" != "1" ]]; then echo "skip $name"; continue; fi
  props='{"palette":"'$pal'"}'; [[ $pal == none ]] && props='{}'
  npx remotion render src/index.ts $comp $OUT/$name.mp4 --props=$props --crf=20 --log=error && \
  ffmpeg -loglevel error -y -ss 4 -i $OUT/$name.mp4 -frames:v 1 -q:v 3 $OUT/$name-poster.jpg && echo "done $name"
done
