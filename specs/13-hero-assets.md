# Spec 13 — Hero assets (OWNER task, then agent step)

## Why this spec exists
The 3D hero is a **frame sequence**: ~96 still images of one watch slowly turning, drawn on a canvas as you scroll.
The frames come from an AI video. `brand/watches/Watch-2.png` is an **Emporio Armani** watch, so it is used **only as a
reference** for angle, lighting and mood. The hero watch must be an **original RIFANO watch** with the RF monogram on the dial
and no third-party marks.

## Part A: Owner (Nano Banana + Veo)

### A1. Design the RIFANO watch (Nano Banana)
Attach **image 1** = `brand/watches/Watch-2.png`, **image 2** = `brand/rifano-logo.PNG`. Prompt:

> Studio product photo of an ORIGINAL men's wristwatch for the brand RIFANO. Use image 1 only as reference for camera angle, lighting and the black studio background. Do not copy its dial pattern, bezel, hands, bracelet or any logo or text.
> Watch: round 41 mm case in polished and brushed stainless steel, slim polished bezel, three-link steel bracelet with brushed centre links, deep black dial with fine vertical brushed texture, slim silver baton indices, sword hands, silver seconds hand, small date window at 3 o'clock.
> Print the "RF" monogram from image 2 in brushed silver just below 12 o'clock. No other text, words or logos anywhere.
> Pure black seamless background, soft rim light from the upper left, gentle highlight sweep on the bezel, ultra-sharp, photorealistic, vertical 4:5.

Then generate **two more angles of the same watch** (feed back your chosen result as reference: "same watch, same lighting"):
- **Start frame**: three-quarter view, watch rotated ~35° to the left, slightly tilted back, partly in shadow.
- **End frame**: straight-on front view (this is also the **poster**).

Checks before moving on: RF is crisp, no stray text or logos, same watch in all angles, background truly black.

### A2. Animate (Veo)
Image-to-video with **first frame = start frame**, **last frame = end frame** (if your Veo only supports a first frame, use the start frame and describe the end). Prompt:

> Slow, perfectly smooth turntable rotation of the wristwatch from a three-quarter view to a straight-on front view while a soft band of light sweeps once across the polished bezel. Camera completely locked off: no zoom, no shake, no cuts. Pure black background, no floor, no reflections, no text, no particles. Elegant, luxurious, calm. 24 fps, 5 seconds, no audio.

Generate 2–4 takes. Pick the one where: motion is even (no speed-ups), the dial and RF don't warp, the bracelet doesn't morph, and the last frame matches the poster.
Save it as `brand/hero/hero.mp4` (create the folder). Also save the end frame PNG as `brand/hero/poster.png`.

If the RF warps in every take: accept a take where the dial is briefly soft mid-turn, as long as the **last ~15 frames** are clean. That's where the scroll stops.

## Part B: Agent (ffmpeg → frames)

### Files
- `theme/assets/hero-d-001.webp … hero-d-096.webp` (desktop), `theme/assets/hero-m-001.webp … hero-m-072.webp` (mobile)
- `brand/hero/` (source, committed), `scripts/make-hero-frames.sh` (new; documents the exact commands)

### ⚠️ Actual source (measured by PM, overrides the generic commands below)
`brand/hero/hero.mp4`: **1280×720 landscape**, 24 fps, 8.0 s, 192 frames, has an audio track (drop it), background pure black (0,0,0).
The clip turns **from near-front to side view**, so it must be **reversed**: the sequence has to END on the front view (matches `poster.png`).
Do **not** upscale (1080×1350 from a 720p source would be soft). The page ground is `--c-bg` (`#000000`), so the frames stay pure black — **no lift filter** (the old 13/14/16 lift belonged to the retired `#0d0e10` ground). Use these instead:
```bash
# 1) find the watch's horizontal centre (union of cropdetect boxes); note the x centre
ffmpeg -i brand/hero/hero.mp4 -vf "cropdetect=limit=24:round=2:reset=0" -f null - 2>&1 | grep -o "crop=[0-9:]*" | tail -1
#    crop=W:H:X:Y → centre CX = X + W/2 ; mobile crop X0 = clamp(CX - 288, 0, 1280-576)
# 2) desktop: 96 frames, native 1280x720 landscape, reversed
ffmpeg -i brand/hero/hero.mp4 -an -vf "fps=12,reverse" -frames:v 96 -c:v libwebp -quality 72 -compression_level 6 theme/assets/hero-d-%03d.webp
# 3) mobile: 72 frames, 576x720 (4:5) crop centred on the watch, reversed
ffmpeg -i brand/hero/hero.mp4 -an -vf "fps=9,reverse,crop=576:720:X0:0" -frames:v 72 -c:v libwebp -quality 68 -compression_level 6 theme/assets/hero-m-%03d.webp
# 4) poster (front view) for the theme setting / reduced-motion fallback
ffmpeg -i brand/hero/poster.png -c:v libwebp -quality 82 brand/hero/hero-poster.webp
```
Check after extraction: `hero-d-096.webp` / `hero-m-072.webp` must be the **front** view; `-001` the turned view.
Delete the PM's check files `brand/hero/_contact.png` and `brand/hero/_poster_small.png`. Commit `brand/hero/hero.mp4` + `poster.png` (they're small).
Budgets below still apply (they will be easily met at this size).

### Generic commands (reference only; superseded by the block above)
Background must match `--c-bg` (#000000), so the frames blend into the page. The page is pure black: no lift filter — frames stay (0,0,0). (The old `lutrgb` 13/14/16 lift belonged to the retired `#0d0e10` ground.)
```bash
# count source frames first: ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 brand/hero/hero.mp4
# desktop: 96 frames, 1080x1350
ffmpeg -i brand/hero/hero.mp4 -vf "fps=96/5,scale=1080:1350:force_original_aspect_ratio=decrease,pad=1080:1350:(ow-iw)/2:(oh-ih)/2:color=black" \
  -frames:v 96 -c:v libwebp -quality 72 -compression_level 6 theme/assets/hero-d-%03d.webp
# mobile: 72 frames, 720x900
ffmpeg -i brand/hero/hero.mp4 -vf "fps=72/5,scale=720:900:force_original_aspect_ratio=decrease,pad=720:900:(ow-iw)/2:(oh-ih)/2:color=black" \
  -frames:v 72 -c:v libwebp -quality 68 -compression_level 6 theme/assets/hero-m-%03d.webp
# poster (upload this one in theme settings → RIFANO → hero_poster)
ffmpeg -i brand/hero/poster.png -vf "scale=1600:-2" -c:v libwebp -quality 82 brand/hero/hero-poster.webp
```
Adjust `fps=N/duration` to the real clip duration (from ffprobe).

### Budgets (check with `du -ch theme/assets/hero-d-* | tail -1`)
- Desktop set ≤ **4 MB** total, mobile set ≤ **1.8 MB**. Over budget → lower `-quality` by 6 and retry; never go below 55; if still over, reduce desktop to 80 frames.
- Spot-check frames 001, 048, 096: background colour must read `#000000 ±1` (sample a corner pixel with ffmpeg or sharp).

## Acceptance
- [ ] Owner approved the generated watch (no third-party marks)
- [ ] 96 + 72 frames in `theme/assets/`, within budget, corner pixel = page background
- [ ] `scripts/make-hero-frames.sh` reproduces them
- [ ] theme check 0 errors

Commit: `feat(13): hero frame sequence + poster`
