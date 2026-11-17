#!/bin/zsh
# Round 3 motion: phone hero with the clean answer still, tighter picker; the wide hero is unchanged from round 2
cd "$(dirname "$0")"
OUT=../assets/motion
r() { npx remotion render src/index.ts $1 out/$2.mp4 --props=$3 --crf=18 --log=error --concurrency=6 \
  && ffmpeg -loglevel error -y -i out/$2.mp4 -vf scale=$6:-2:flags=lanczos -c:v libx264 -preset slow -crf $5 -pix_fmt yuv420p -movflags +faststart $OUT/$2.mp4 \
  && ffmpeg -loglevel error -y -ss $4 -i out/$2.mp4 -frames:v 1 -q:v 3 $OUT/$2-poster.jpg \
  && ffmpeg -loglevel error -y -ss 0.4 -i out/$2.mp4 -frames:v 1 -q:v 3 $OUT/$2-start.jpg && echo "done $2 $(du -h $OUT/$2.mp4 | cut -f1)"; }
r DevelopPhone develop-r3-phone '{"layout":"phone"}' 21 33 720
r PickerDevelop picker-r3 '{}' 16.2 26 1240
# opening frame of the unchanged wide hero, used as its poster while motion is on
ffmpeg -loglevel error -y -ss 0.4 -i out/develop-r2.mp4 -frames:v 1 -q:v 3 $OUT/develop-r2-start.jpg && echo "done start poster"
