#!/bin/zsh
# Round 3 motion assets: portrait cuts for phones plus fixes (suffix 3)
cd "$(dirname "$0")"
OUT=../assets/motion
r() { npx remotion render src/index.ts $1 $OUT/$2.mp4 --props=$3 --crf=20 --log=error && ffmpeg -loglevel error -y -ss ${4:-4} -i $OUT/$2.mp4 -frames:v 1 -q:v 3 $OUT/$2-poster.jpg && echo "done $2"; }
for pal in ink graphite paper amber night; do r SealedTall sealed3-tall-$pal "{\"palette\":\"$pal\",\"layout\":\"tall\"}" 7.5; done
r Sealed sealed3-graphite '{"palette":"graphite"}' 5
r TourSearchTall tour3-search-tall '{"cut":"search","palette":"ink","portrait":true}' 2.8
r TourBrowseTall tour3-browse-tall '{"cut":"browse","palette":"ink","portrait":true}' 4
r TourVerifyTall tour3-verify-tall '{"cut":"verify","palette":"ink","portrait":true}' 4
r TourBrowse tour3-browse '{"cut":"browse","palette":"ink"}' 4
for pal in graphite night; do r Wheel wheel3-$pal "{\"palette\":\"$pal\"}" 4; r WheelTall wheel3-tall-$pal "{\"palette\":\"$pal\",\"layout\":\"tall\"}" 4; done
ffmpeg -loglevel error -y -ss 2.8 -i $OUT/tour-search.mp4 -frames:v 1 -q:v 3 $OUT/tour3-search-poster.jpg && echo "done poster"
ffmpeg -loglevel error -y -ss 4.5 -i $OUT/tour-verify.mp4 -frames:v 1 -q:v 3 $OUT/tour3-verify-poster.jpg && echo "done poster2"
