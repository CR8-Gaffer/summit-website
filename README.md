# Summit Asset Maintenance — website

Static marketing site for Summit Asset Maintenance Pty Ltd (NSW).
Live: https://cr8-gaffer.github.io/summit-website/ (production domain: summitam.com.au, pending DNS).

## Stack

Plain HTML/CSS/JS — no build step, no framework, no package manager.
Self-hosted fonts (Montserrat + IBM Plex Mono woff2). GSAP + ScrollTrigger
(vendored) power the scroll-scrubbed canvas sequence on `exhaust.html` only.

## Structure

```
*.html            one file per page (index, exhaust, soak-tanks, drone,
                  compliance, about, reporting, guide, contact, privacy, 404)
css/site.css      the entire shared design system
css/kes.css       exhaust-page scroll experience only
js/site.js        nav behaviour, reveals, hero video
js/kes.js         canvas frame-scrub engine (exhaust page)
js/contact.js     enquiry form submit (endpoint configured at top of file)
frames/           145-frame webp sequence + manifest.json
assets/           fonts, images, video, favicon, OG card
```

## Local development

Any static server from the repo root, e.g.:

```
python3 -m http.server 8769
```

`exhaust.html?shot=0.5` renders the scroll sequence at a fixed progress
(0–1) for screenshots/testing. `?reduced=1` forces the reduced-motion path.

## Deploy

Push to `main` → GitHub Actions uploads the repo as-is to GitHub Pages
(`.github/workflows/deploy.yml`; static upload, no build; includes a retry
for Pages' occasional transient deploy failures).

## Engine notes (exhaust page)

Two hard-won rules — do not regress them:

1. **Never apply `ctx.filter` in the per-frame draw path.** The dark grade
   lives as a CSS `filter` on the `#kes` canvas element (GPU). Doing it in
   canvas 2D measured ~75ms per draw vs ~7ms raw.
2. **No scroll-hijacking/smoothing libraries.** Native scroll feeds
   ScrollTrigger; a frame stepper in `js/kes.js` walks the drawn frame
   toward the scroll target so the sequence plays through without jumps.
   Wheel-smoothing libraries caused trackpad stall/judder.
