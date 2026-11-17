#!/bin/zsh
# Render the garage motion pieces into ../assets/motion. Usage: ./render.sh [suffix]  (suffix tags a round, e.g. 2)
cd "$(dirname "$0")"
OUT=../assets/motion
S=${1:-1}
mkdir -p $OUT
r() { # comp, name, poster-seconds, crf
  npx remotion render src/index.ts $1 $OUT/$2.mp4 --crf=${4:-20} --log=error \
  && ffmpeg -loglevel error -y -ss $3 -i $OUT/$2.mp4 -frames:v 1 -q:v 2 $OUT/$2-poster.jpg && echo "done $2"
}
st() { npx remotion still src/index.ts $1 $OUT/$2.png --log=error && ffmpeg -loglevel error -y -i $OUT/$2.png -q:v 2 $OUT/$2.jpg && rm $OUT/$2.png && echo "done $2"; }
r DoorStage door-stage-r$S 5 21
r DoorStageTall door-stage-tall-r$S 5 21
r RollUp rollup-r$S 3.4 20
r RollUpTall rollup-tall-r$S 3.4 20
r VerifyTour verify-r$S 7.3 20
r VerifyTourTall verify-tall-r$S 7.3 20
st DoorHalf door-half-r$S
st DoorHalfTall door-half-tall-r$S
ls -la $OUT
if [ "$S" -ge 2 ]; then
  r Threshold threshold-r$S 5 21
  r ThresholdTall threshold-tall-r$S 5 21
  r AppLit applit-r$S 2.2 20
  r AppLitTall applit-tall-r$S 2.2 20
fi
