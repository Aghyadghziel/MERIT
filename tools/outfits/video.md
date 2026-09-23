# Preparing a dressing clip

A dressing clip is a filmed transition: the same model, in the same frame,
physically putting a garment on. The carousel plays it instead of animating.

Two things make it drop into the page invisibly.

## 1. Flatten the backdrop to bone

A studio clip has a vignette — bright in the middle, falling off at the edges —
so dropping it on the page shows an obvious rectangle. Rather than matting the
model out (which eats light garments and white shoes), divide the vignette out:

1. Take the temporal median of every 4th frame. The backdrop is static, so this
   is the backdrop wherever the model moved away from it.
2. Fit a degree-3-in-x, degree-2-in-y surface to the pixels the model never
   reaches (the side margins and the band above his head).
3. Refine it by normalised convolution, so the measured margins are reproduced
   exactly and the fit only fills the strip the model occupies.
4. `out = frame / plate * bone`. Background pixels land on exactly bone; the
   model is multiplied by a smooth factor near 1.0 and keeps his floor shadow.

Residual on this clip: 1.3 levels mean, 5.3 at p99 — invisible.

## 2. Align on the head axis

The still contract puts the figure's top at 5.56% of the canvas height and its
height at 91.06% (see FRAME in src/lib/outfits.ts). Measure the clip's figure
the same way, then crop and scale so those two numbers match, centring the crop
on the model's head axis **in the settled final frame** — that is the state that
persists, so it must be the one that is exact.

The clip's canvas may be wider than the still's (this one is 1040×1200 against
1200×1800) to leave room for swinging arms. Both are rendered `height: 100%`,
width auto, centred, so the model still lands in the same place.

## 3. Export

- `dress-NN.mp4` (h264, yuv420p, crf 24, faststart, **no audio**)
- `dress-NN.webm` (vp9, crf 40)
- `dress-NN-m.mp4` (520×600, crf 25) for phones
- `undress-NN.mp4` / `-m.mp4` — the same frames with `-vf reverse`
- `outfit-NN-dressed.webp` — the **last** frame, which the video hands off to
- `outfit-NN-start.webp` — the first frame

The dressed still must be the video's own last frame. Anything else shows as a
jump the moment playback ends.
