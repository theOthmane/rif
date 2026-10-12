#!/usr/bin/env bash
# make-hero-frames.sh — spec 13 Part B: build the hero frame sequence from brand/hero/hero.mp4
#
# Source (measured by PM, verified with ffprobe 2026-10-12):
#   brand/hero/hero.mp4 — 1280x720 landscape, h264, 24 fps, 8.0 s, 192 frames,
#   AAC audio present (dropped with -an), background pure black.
#   The clip turns NEAR-FRONT -> SIDE, so every sequence is REVERSED:
#   the sequence must END on the front view to match poster.png.
#
# Horizontal centre of the watch (union of cropdetect boxes, reset=0):
#   final box crop=444:508:446:62  ->  watch spans x 446..890
#   CX = 446 + 444/2 = 668
#   Mobile crop X0 = clamp(CX - 288, 0, 1280-576) = clamp(380, 0, 704) = 380
#   -> mobile crop=576:720:380:0 is centred on the watch (380+288 = 668 = CX).
#
# Constraints: NO upscale (720p source), NO lift filter (page ground is --c-bg
# #000000 and the frames are already (0,0,0); the old 13/14/16 lutrgb lift
# belonged to the retired #0d0e10 ground), audio dropped.
#
# Budgets: desktop set <= 4 MB, mobile set <= 1.8 MB (du -ch).
# Over budget -> lower -quality by 6, never below 55; last resort: 80 desktop frames.
#
# Reproduce with:  bash scripts/make-hero-frames.sh   (run from the repo root)

set -euo pipefail

SRC="brand/hero/hero.mp4"

# Clean slate so a re-run never mixes old and new frames.
rm -f theme/assets/hero-d-*.webp theme/assets/hero-m-*.webp

# 1) Desktop: 96 frames, native 1280x720 landscape (fps 24->12 = 8s*12), reversed.
ffmpeg -hide_banner -loglevel error -i "$SRC" -an \
  -vf "fps=12,reverse" \
  -frames:v 96 -c:v libwebp -quality 72 -compression_level 6 \
  theme/assets/hero-d-%03d.webp

# 2) Mobile: 72 frames, 576x720 (4:5) crop centred on the watch (X0=380), reversed.
ffmpeg -hide_banner -loglevel error -i "$SRC" -an \
  -vf "fps=9,reverse,crop=576:720:380:0" \
  -frames:v 72 -c:v libwebp -quality 68 -compression_level 6 \
  theme/assets/hero-m-%03d.webp

# 3) Poster (front view) for the hero_poster theme setting / reduced-motion
#    fallback. Kept at its native 896x1112 (4:5) — no scaling.
ffmpeg -hide_banner -loglevel error -i brand/hero/poster.png \
  -c:v libwebp -quality 82 \
  brand/hero/hero-poster.webp

echo "desktop frames: $(ls theme/assets/hero-d-*.webp | wc -l)"
echo "mobile frames:  $(ls theme/assets/hero-m-*.webp | wc -l)"
du -ch theme/assets/hero-d-*.webp | tail -1
du -ch theme/assets/hero-m-*.webp | tail -1
ls -l brand/hero/hero-poster.webp
