# Summit Asset Maintenance — website

Static marketing site for Summit Asset Maintenance Pty Ltd, Adelaide.
Live: https://summitassetmaintenance.com.au/ (GitHub Pages).

## Stack

Plain HTML/CSS/JS — no build step, no framework, no package manager.
Self-hosted fonts (IBM Plex Sans + Montserrat woff2). No third-party scripts.
The pages are generated from a separate source and published here as-is; edit the source, not these files.

## Structure

```
*.html            one file per page: index, program (Services hub), pressure-cleaning,
                  containment, filters, soak-tanks, certificate, site-survey, guide,
                  about, contact, form-3, how-often-kitchen-exhaust-cleaning,
                  referrers, privacy, 404, and drone (coming soon, noindex, not in the
                  sitemap); exhaust, planner, compliance and reporting are redirect
                  stubs for retired URLs
css/site.css      the entire shared design system
js/site.js        nav behaviour, reveals, phone action bar
js/contact.js     enquiry form submit (endpoint configured at top of file)
assets/           fonts (IBM Plex Sans + Montserrat woff2), images (illustrative
                  generated imagery in img/gen), video (hero and page-header footage),
                  favicon, OG card
sitemap.xml      lists every indexable page; robots.txt allows all
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
