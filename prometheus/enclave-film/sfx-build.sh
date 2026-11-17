#!/bin/sh
# Builds the film's sound effects (public/sfx/) from the ElevenLabs takes in sfx-src/.
# Each file is trimmed to start on its transient (so it lands on the frame where MosaicFilm.tsx places it)
# and peak-levelled to sit under the soundtrack. The tick runs are pre-timed to the frames where each PCR0
# column turns (see SFX in MosaicFilm.tsx). Needs ffmpeg + python3.
cd "$(dirname "$0")"
S=sfx-src; O=public/sfx
# peak-normalise: lvl IN OUT TARGET_dBFS [extra filters]
lvl() {
  pk=$(ffmpeg -hide_banner -nostats -i "$1" -af "${4:+$4,}volumedetect" -f null - 2>&1 | sed -n 's/.*max_volume: \(-*[0-9.]*\) dB/\1/p')
  ffmpeg -v error -y -i "$1" -af "${4:+$4,}volume=$(python3 -c "print($3-($pk))")dB" -ar 48000 -ac 2 "$2"
}
lvl $S/click.wav    $O/click.wav    -17 "atrim=start=0.055,asetpts=PTS-STARTPTS"
lvl $S/keys.wav     $O/keys.wav     -23 "atrim=start=0.125:duration=2.45,asetpts=PTS-STARTPTS,afade=t=out:st=2.15:d=0.3"
lvl $S/chime.wav    $O/chime.wav    -19 "atrim=start=0.055,asetpts=PTS-STARTPTS"
lvl $S/deny.wav     $O/deny.wav     -19 "atrim=start=0.105,asetpts=PTS-STARTPTS"
lvl $S/scramble.wav $O/scramble.wav -19 "atrim=start=0.08,asetpts=PTS-STARTPTS,afade=t=out:st=1.1:d=0.3"
lvl $S/pressure.wav $O/pressure.wav -22 "afade=t=out:st=1.4:d=0.5"
lvl $S/unlock.wav   $O/unlock.wav   -17 "atrim=start=0.095,asetpts=PTS-STARTPTS"
# one clean tick (50 ms) cut from the ticking take
ffmpeg -v error -y -i $S/ticks.wav -af "atrim=start=0.138:duration=0.05,asetpts=PTS-STARTPTS,afade=t=out:st=0.04:d=0.01" -ar 48000 -ac 2 /tmp/ppq-tick.wav
# run OUT TARGET "frame:rate frame:rate ..."  (frames at 30 fps, relative to the first; rate = pitch ratio)
run() {
  out=$1; tgt=$2; shift 2; ins=""; fl=""; i=0; base=""
  for c in $1; do f=${c%%:*}; r=${c##*:}; [ -z "$base" ] && base=$f
    ms=$(( (f - base) * 1000 / 30 )); ins="$ins -i /tmp/ppq-tick.wav"
    fl="$fl[$i]asetrate=48000*$r,aresample=48000${3:+,$3},adelay=${ms}|${ms}[t$i];"; i=$((i+1)); done
  mix=""; j=0; while [ $j -lt $i ]; do mix="$mix[t$j]"; j=$((j+1)); done
  ffmpeg -v error -y $ins -filter_complex "${fl}${mix}amix=inputs=$i:normalize=0" /tmp/ppq-run.wav
  lvl /tmp/ppq-run.wav $out $tgt
}
# good check: 12 columns, gently rising (4 semitones over the run)
run $O/ticks-check.wav -17 "504:1 508:1.025 512:1.051 515:1.077 519:1.104 522:1.132 526:1.160 530:1.189 533:1.219 537:1.249 540:1.281 544:1.313"
# modified build: the same columns, fast and flat
run $O/ticks-fast.wav -20 "630:1 632:1 633:1 635:1 636:1 638:1 639:1 641:1 642:1 644:1 645:1 647:1"
# your IP pixelating: 4 steps, descending and bit-crushed
run $O/ticks-pixel.wav -17 "1285:0.84 1289:0.75 1292:0.67 1296:0.59" "acrusher=bits=6:mode=lin:mix=0.6"
rm -f /tmp/ppq-tick.wav /tmp/ppq-run.wav
echo "sfx built"
