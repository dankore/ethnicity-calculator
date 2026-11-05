# Roadmap

Planned work, roughly in order. Each item is tracked as a GitHub issue.

## Quality

- [ ] **Unit tests for the math.** Move the calculation (weights, rounding, totals, merging the same ethnicity from both sides) into its own module and cover it with tests, including rows that don't add up to 100%.
- [ ] **End-to-end tests.** Playwright tests for parents mode, grandparents mode, samples, reset, share and the downloaded result card, run in CI before deploy.
- [ ] **Split `script.js`.** It is about 1,150 lines; break it into modules (calculator, result card, animations, analytics, theme) bundled by the existing build step.
- [ ] **Accessibility pass.** Screen reader labels for the donut chart and result list, keyboard order for adding and removing rows, and reduced-motion checks for the canvas animations.

## Features

- [ ] **Great-grandparents mode** (eight people, 12.5% each).
- [ ] **Unknown ancestry handling.** Let a person be partly or fully "unknown" and show it clearly in the result instead of forcing 100%.
- [ ] **Shareable result links.** Encode the inputs in the URL so a shared link opens the same result.
- [ ] **Hausa and French translations** of the page and result card.
- [ ] **Larger, searchable ethnicity list** grouped by region.

## Android and release

- [ ] **Play Store release of the Android app** (version 3 targets Android 16) and an in-app update prompt.
- [ ] **Automated Lighthouse check in CI** so performance, accessibility and SEO scores stay at 100.
