import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
          <p className="eyebrow">Semantic Quay, Inc.</p>
          <h1 className="font-display mt-6 max-w-4xl text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
            The dock where meaning&nbsp;and data are loaded and&nbsp;moved.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            An engineering and advisory practice modernizing banking data
            infrastructure with AI — metadata-driven pipelines and published
            semantic models, built on the controlled data models banks already
            trust.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/developers"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              View the developers reference
              <Arrow />
            </Link>
            <Link
              href="#approach"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
            >
              The approach
              <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Origin */}
      <section className="border-t border-line bg-paper-soft">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-4">
            <p className="eyebrow">The name</p>
            <h2 className="font-display mt-4 text-2xl font-medium tracking-tight text-ink md:text-3xl">
              Semantic, and a&nbsp;quay.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted md:col-span-7 md:col-start-6 md:text-lg">
            <p>
              The firm took shape during an engagement with a global investment
              bank — work that led, among other places, to Singapore, a city
              defined by its <em className="text-ink not-italic">quays</em>: the
              waterfront edges where cargo docks, loads, and moves on.
            </p>
            <p>
              There, a colleague was working at the frontier of{" "}
              <em className="text-ink not-italic">semantic data modeling</em>.
              The name fuses the two. A quay is infrastructure — the point where
              value is transferred. Semantic Quay builds the docks where meaning
              and data are loaded and moved.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Approach */}
      <section id="approach" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">The approach</p>
            <h2 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
              Banks already have the hard part. The slow part is everything
              downstream.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              The controlled business and physical data models that banks depend
              on are sound. What drifts and stalls is the layer on top — the
              pipelines, the classification, the semantic models, and the
              contracts that connect them. A single governed metadata spec can
              drive all of it, automatically, without weakening control.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {approach.map((item) => (
              <div key={item.no} className="bg-paper p-8">
                <span className="font-mono text-sm text-accent">{item.no}</span>
                <h3 className="font-display mt-4 text-xl font-medium tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Proof */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="eyebrow" style={{ color: "var(--color-accent-bright)" }}>
                Published, not slideware
              </p>
              <h2 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
                An open reference architecture.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-paper/70 md:text-lg">
                The practice publishes a generic, illustrative reference
                implementation of a metadata-driven data mesh — readable,
                runnable, and free to adapt. It is the credibility engine:
                engineering you can inspect, not a deck.
              </p>
              <Link
                href="/developers"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper-soft"
              >
                Explore the reference
                <Arrow />
              </Link>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              <PipelineDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Contact */}
      <section id="contact" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">Work together</p>
            <h2 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
              For institutions modernizing the data layer.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Semantic Quay takes on a small number of advisory and engineering
              engagements around metadata-driven pipelines and semantic
              modeling. Inquiries are welcome.
            </p>
            <a
              href="mailto:hello@semanticquay.com"
              className="mt-8 inline-flex items-center gap-2 text-base font-medium text-ink transition-colors hover:text-accent"
            >
              hello@semanticquay.com
              <Arrow />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------- content data */

const approach = [
  {
    no: "01",
    title: "Controlled foundation",
    body: "Robust business and physical data models stay the source of truth. The metadata spec sits on top of them — it references the controlled models, it never replaces them.",
  },
  {
    no: "02",
    title: "Metadata-driven automation",
    body: "One declarative spec generates the medallion pipelines, schedules, lineage, and operational views. Change the spec; the downstream surfaces regenerate. No drift across three places.",
  },
  {
    no: "03",
    title: "Published semantic models",
    body: "The semantic layer and data products are generated from the same spec and published as machine-readable contracts — discoverable, versioned, classified end to end.",
  },
];

/* ----------------------------------------------------------------- graphics */

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path
        d="M3 8h9M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Faint node–edge constellation resting on a quay line, behind the hero. */
function HeroBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* quay line */}
        <line x1="0" y1="470" x2="1200" y2="470" stroke="var(--color-line)" strokeWidth="1" />
        {[180, 360, 540, 720, 900, 1080].map((x) => (
          <line key={x} x1={x} y1="470" x2={x} y2="486" stroke="var(--color-line)" strokeWidth="1" />
        ))}
        {/* edges */}
        <path
          d="M180 470 L300 250 L540 320 L760 180 L980 300 L1080 470 M300 250 L540 470 M760 180 L760 470 M540 320 L760 470"
          stroke="var(--color-accent)"
          strokeOpacity="0.35"
          strokeWidth="1.25"
          fill="none"
        />
        {/* nodes */}
        {[
          [300, 250],
          [540, 320],
          [760, 180],
          [980, 300],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="var(--color-accent)" fillOpacity="0.6" />
        ))}
        <rect x="0" y="300" width="1200" height="300" fill="url(#fade)" />
      </svg>
    </div>
  );
}

/** Horizontal medallion pipeline, generic/illustrative. */
function PipelineDiagram() {
  const stages = [
    { k: "BDM / PDM", t: "controlled models" },
    { k: "Bronze", t: "raw, archived" },
    { k: "Silver", t: "conformed, classified" },
    { k: "Gold", t: "curated marts" },
    { k: "Semantic", t: "published models" },
    { k: "Warehouse", t: "serving" },
  ];
  return (
    <div className="rounded-2xl border border-line-bright bg-ink-soft p-6 md:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-paper/45">
        one governed spec →
      </p>
      <ol className="mt-5 space-y-3">
        {stages.map((s, i) => (
          <li key={s.k} className="flex items-center gap-4">
            <span className="w-5 shrink-0 font-mono text-xs text-accent-bright">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 rounded-lg border border-line-bright bg-ink px-4 py-2.5">
              <span className="font-display text-base text-paper">{s.k}</span>
              <span className="ml-2 text-xs text-paper/45">{s.t}</span>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 font-mono text-[0.7rem] leading-relaxed text-paper/40">
        Databricks · Cube Cloud · Snowflake — illustrative, vendor-generic.
      </p>
    </div>
  );
}
