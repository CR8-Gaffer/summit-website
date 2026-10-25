# Summit Asset Maintenance — website

Static marketing site for Summit Asset Maintenance Pty Ltd, Adelaide.
Live: https://summitassetmaintenance.com.au/ (GitHub Pages; the cr8-gaffer.github.io/summit-website origin redirects there).

## Stack

Plain HTML/CSS/JS — no build step, no framework, no package manager.
Self-hosted fonts (IBM Plex Sans + Montserrat woff2). No third-party scripts.

## Structure

```
*.html            one file per page (index, program, certificate, site-survey,
                  guide, about, contact, form-3, how-often-kitchen-exhaust-cleaning,
                  referrers, privacy, 404, drone); exhaust, planner, pressure-cleaning,
                  compliance, reporting and soak-tanks are redirect stubs for retired URLs
css/site.css      the entire shared design system
js/site.js        nav behaviour, reveals, phone action bar
js/contact.js     enquiry form submit (endpoint configured at top of file)
assets/           fonts (IBM Plex Sans + Montserrat woff2), images, video, favicon, OG card
```

## Local development

Any static server from the repo root, e.g.:

```
python3 -m http.server 8769
```

## Deploy

Push to `main` → GitHub Actions uploads the repo as-is to GitHub Pages
(`.github/workflows/deploy.yml`; static upload, no build; includes a retry
for Pages' occasional transient deploy failures).
