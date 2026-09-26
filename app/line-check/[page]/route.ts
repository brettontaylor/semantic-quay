/**
 * /line-check/<page> — further unlisted working pages in the Line Check section.
 * Each page body lives in a secret gist (never in this repo); this map is the only thing here.
 * Static siblings (quote-engine-poc) take precedence over this dynamic segment.
 */
import { NextRequest } from "next/server";

const OWNER = "brettontaylor";
const PAGES: Record<string, string> = {
  build: "c738dcf5e262202bbd91e0b4a2fb7ce6",
};

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ page: string }> }) {
  const { page } = await ctx.params;
  const gist = PAGES[page];
  if (!gist) return notFound();
  const upstream = await fetch(`https://gist.githubusercontent.com/${OWNER}/${gist}/raw/`, {
    next: { revalidate: 60 },
    headers: { accept: "text/html,text/plain" },
  });
  if (!upstream.ok) return notFound();
  const html = await upstream.text();
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow, noarchive",
      "cache-control": "private, no-store",
      "referrer-policy": "no-referrer",
    },
  });
}

function notFound() {
  return new Response("Not found", { status: 404, headers: { "x-robots-tag": "noindex, nofollow" } });
}
