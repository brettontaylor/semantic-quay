@AGENTS.md

# Semantic Quay — site

Public website for **Semantic Quay, Inc.**, an engineering/advisory practice
modernizing banking data infrastructure with AI. Orchestrated from the private
`C:\BTCENTER\semantic-quay\` planning hub (strategy, roadmap, architecture).

## Non-negotiables

- **Anonymous, third person.** The principal is never named anywhere on the site.
- **Zero IP.** Generic and illustrative only — no employer or client names, no
  real data, no proprietary BDM/PDM schemas. Illustrative domain is a synthetic
  capital-markets dataset.

## Stack & conventions

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS **v4**.
- Tailwind v4 is **CSS-first**: brand tokens live in `app/globals.css` under
  `@theme` (e.g. `--color-ink`, `--color-paper`, `--color-accent`). Use the
  generated utilities (`bg-paper`, `text-ink`, `border-line`, etc.). There is no
  `tailwind.config.js`.
- Brand: Fraunces (display, via `.font-display`) · Inter (body) · JetBrains Mono.
  Mark in `components/Logo.tsx` (node–edge graph on a quay line; uses currentColor).
- Verify with `npx tsc --noEmit` and `npm run build` before shipping.

## Deploy

Railway, auto-deploy on push to `main`. Secrets in
Railway Variables; `.env.example` is the committed template. Domain TBD — running
on a Railway placeholder URL until registered.
