# Contributing to The Green Orbit Project

Thanks for your interest in improving GreenOrbit! 🌱

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Run the app locally: `npm run dev`

## Guidelines

- Keep pull requests focused: one feature or fix per PR.
- Write clear commit messages (e.g. `feat: add PDF export`, `fix: handle empty NASA POWER response`).
- Never commit API keys or `.env` files.
- Recommendations must stay **explainable**: every score or suggestion should show its reasoning.
- Cite the data source for any new dataset or API you add.

## Reporting bugs

Open an issue with:
- What you expected vs. what happened
- Steps to reproduce (include the location searched, if relevant)
- Browser/OS and screenshots if possible

## Suggesting features

Open an issue describing the problem you want to solve and who it helps.

## Pull request checklist

- [ ] The app builds (`npm run build`)
- [ ] No secrets or keys included
- [ ] README updated if behavior or setup changed
