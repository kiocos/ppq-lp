#!/bin/zsh
# Round 2 motion: Develop v2 (duotone, packet, darker field), phone cut, PickerDevelop
cd "$(dirname "$0")"
OUT=../assets/motion
r() { npx remotion render src/index.ts $1 out/$2.mp4 --props=$3 --crf=18 --log=error --concurrency=6 \
  && ffmpeg -loglevel error -y -i out/$2.mp4 -vf scale=$6:-2:flags=lanczos -c:v libx264 -preset slow -crf $5 -pix_fmt yuv420p -movflags +faststart $OUT/$2.mp4 \
  && ffmpeg -loglevel error -y -ss $4 -i out/$2.mp4 -frames:v 1 -q:v 3 $OUT/$2-poster.jpg && echo "done $2 $(du -h $OUT/$2.mp4 | cut -f1)"; }
r Develop develop-r2 '{"layout":"wide"}' 21 33 1600
r DevelopPhone develop-r2-phone '{"layout":"phone"}' 21 33 720
r PickerDevelop picker-r2 '{}' 12 26 1240
