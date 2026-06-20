# Semantic Quay

Public website for **Semantic Quay, Inc.** — an engineering and advisory practice
modernizing banking data infrastructure with AI.

Anonymous, third-person marketing site plus a **developers** section that publishes
a generic, illustrative reference architecture for metadata-driven data-mesh
pipelines and semantic-model publishing.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first config in `app/globals.css`)
- Fonts: Fraunces (display) · Inter (body) · JetBrains Mono
- Deploy target: **Railway** (auto-deploy on push to `main`)

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npx tsc --noEmit # typecheck
```

## Structure

```
app/
  layout.tsx         # fonts, metadata, header/footer shell
  page.tsx           # homepage (hero, origin, approach, proof, contact)
  developers/        # reference-architecture portal
  globals.css        # brand tokens (Tailwind v4 @theme)
components/
  Logo.tsx           # brand mark (node–edge graph on a quay line)
  Header.tsx / Footer.tsx
```

## Guardrail

All published content is **generic and illustrative**. No client names, real data,
or proprietary schemas.
