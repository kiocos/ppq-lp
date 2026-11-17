#!/bin/sh
# Renders review stills of the film at the given seconds: sh stills.sh <comp> <prefix> 1 5 9 ...
cd "$(dirname "$0")"
comp=$1; pre=$2; shift 2
for s in "$@"; do f=$(echo "$s * 30 / 1" | bc); npx remotion still src/index.ts $comp out/$pre-$s.png --frame=$f --log=error && echo "out/$pre-$s.png"; done
