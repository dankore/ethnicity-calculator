# Ethnicity Calculator

Find your ethnic percentage from your parents or grandparents. Enter each person's mix, and the calculator weaves it into yours: half from each parent, or a quarter from each grandparent.

Live at **[ethnicity-calculator.dankoresoft.com](https://ethnicity-calculator.dankoresoft.com/)**. It has been live since 2023 and got about 1,700 visits from Google search in August to October 2026 alone. There is an Android app (Trusted Web Activity) built from the same site.

## Who it's for

People who know their family background and want a clear number for it, for example someone with a Hausa mother and a Fulani-Kanuri father, or an American with Mexican, Irish, Jamaican and Chinese grandparents. It works for any ethnicity; the suggestion list includes about 70, with a strong set of Nigerian and West African groups.

## Features

- **Parents mode** (each parent counts 50%) and **grandparents mode** (each grandparent counts 25%)
- Several ethnicities per person, with a running total so each person adds up to 100%
- Sample families to try in one tap
- Result as a donut chart with percentages, plus confetti
- Share the result (native share sheet on phones) or download it as a PNG result card
- Your inputs are saved in your browser (`localStorage`) and never sent to a server
- Light and dark themes
- Installable PWA with an offline-capable service worker; Android app through Bubblewrap

## Built with

- Plain HTML, CSS and JavaScript (no framework), with a small Node build script (`build.mjs`) that expands shared partials, inlines minified CSS (clean-css), and minifies and fingerprints the script (terser)
- Canvas animations for the "heritage threads" hero
- nginx in Docker, deployed to CapRover by GitHub Actions through [`dankore/github-to-caprover`](https://github.com/dankore/github-to-caprover)
- Google AdSense and Google Analytics, both loaded only after the first interaction so they don't slow the first paint (Lighthouse 100)

## Run it locally

You need Node.js 24 or newer.

```bash
git clone https://github.com/dankore/ethnicity-calculator.git
cd ethnicity-calculator
npm ci
npm run build                 # writes dist/
npx serve dist                # or: python3 -m http.server -d dist 8000
```

Edit `index.html`, `script.js`, `styles.css` or the files in `partials/`, then run `npm run build` again.

### With Docker

```bash
docker build -t ethnicity-calculator .
docker run --rm -p 8080:8080 ethnicity-calculator
# open http://localhost:8080
```

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | The calculator page |
| `script.js` | Calculator, result card, sharing, theme, animations |
| `styles.css` | All styles (inlined at build time) |
| `partials/` | Shared head, header and footer |
| `build.mjs` | Build script that writes `dist/` |
| `service-worker.js` | Network-first caching and offline support |
| `android/twa-manifest.json` | Bubblewrap config for the Android app |
| `.github/workflows/deploy.yaml` | Builds the Docker image and deploys to CapRover |

## Deployment

Every push to `main` builds a Docker image, pushes it to GitHub Container Registry, and deploys it to CapRover. The workflow reads `CAPROVER_URL`, `CAPROVER_APP_TOKEN` and `CAPROVER_APP` from GitHub Actions secrets; no secrets live in this repository.

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## License

[MIT](./LICENSE) © Dankore Software LLC
