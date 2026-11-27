# Tanish Jaswal — notebook portfolio

A single-page portfolio in a warm **notebook** aesthetic: paper grain, ruled lines,
marker highlight, pixel cursor, and a picture-rail gallery where the projects hang
as framed prints.

Plain vanilla **HTML + CSS + JS** — no build step, no frameworks.

## Run

Any static server from the repo root works:

```
py -m http.server 8000
# → http://127.0.0.1:8000
```

## What's inside

| Path | What it is |
|---|---|
| `index.html` | The whole page: hero, stats, education/experience, GitHub activity, skills, project gallery, contact |
| `styles.css` | Notebook design system (tokens on `:root`, all sections, reduced-motion variants) |
| `script.js` | Hero intro (typed greeting docks into the nav), picture-rail gallery engine, pixel cursor, heatmap, reveals, contact form |
| `fonts/` | Self-hosted Oswald, Public Sans, Courier Prime (woff2) |
| `img/og-image.png` | Social share image (1200×630) |
| `tools/og-image.html` | Generator page for the share image — open it, screenshot at 1200×630 |

## Highlights

- **Hero**: a typed greeting ("Hi, I'm Tanish.") docks into the nav, content rises line by
  line, a marker highlight draws across the headline, experience chips (IKGPTU, Netmax)
  open timeline popovers.
- **Projects**: five framed prints hang from an oak rail — brush the rail to light one up,
  drag a frame (it swings and shoves its neighbours), click to lift it off the wall into a
  dialog that flips over to a kraft-paper project label with the stack + GitHub link.
  Keyboard accessible (arrow keys, Esc); becomes a swipeable carousel on phones.
- **Contact**: a dated letter sheet with a reply stamp and subject quick-chips that fill the
  subject field; the form composes a mailto.
- Honors `prefers-reduced-motion` throughout; renders fully without JavaScript.

## GitHub

Designed content links to [github.com/WARRIORXR](https://github.com/WARRIORXR).
Contribution heatmap data is a static snapshot; refresh `START`/`LEVELS` in `script.js`
to update it.
