#!/bin/zsh
# Round 1 motion: the Develop hero (wide + phone)
cd "$(dirname "$0")"
OUT=../assets/motion
r() { npx remotion render src/index.ts $1 out/$2.mp4 --props=$3 --crf=18 --log=error --concurrency=6 \
  && ffmpeg -loglevel error -y -i out/$2.mp4 -vf scale=${6:-1600}:-2:flags=lanczos -c:v libx264 -preset slow -crf ${5:-27} -pix_fmt yuv420p -movflags +faststart $OUT/$2.mp4 \
  && ffmpeg -loglevel error -y -ss $4 -i out/$2.mp4 -frames:v 1 -q:v 3 $OUT/$2-poster.jpg && echo "done $2 $(du -h $OUT/$2.mp4 | cut -f1)"; }
r DevelopR1 develop-r1 '{"layout":"wide"}' 17.5
r DevelopR1Phone develop-r1-phone '{"layout":"phone"}' 17.5 27 720
