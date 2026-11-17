#!/bin/zsh
# Round 3: doors fade into the dark at the top, closer roll-up start, captions clear of the UI
cd "$(dirname "$0")"
OUT=../assets/motion
r() { npx remotion render src/index.ts $1 $OUT/$2.mp4 --crf=${4:-20} --log=error && ffmpeg -loglevel error -y -ss $3 -i $OUT/$2.mp4 -frames:v 1 -q:v 2 $OUT/$2-poster.jpg && echo "done $2"; }
st() { npx remotion still src/index.ts $1 $OUT/$2.png --log=error && ffmpeg -loglevel error -y -i $OUT/$2.png -q:v 2 $OUT/$2.jpg && rm $OUT/$2.png && echo "done $2"; }
r DoorStageFade door-stage-r3 5 21
r DoorStageFadeTall door-stage-tall-r3 5 21
r RollUp rollup-r3 3.4 20
r RollUpTall rollup-tall-r3 3.4 20
st DoorHalfFade door-half-r3
st DoorHalfFadeTall door-half-tall-r3
