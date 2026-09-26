/**
 * /line-check — an unlisted working brief. Same mechanism as /b/[gist]: the page body lives in a
 * secret gist, never in this repo. Served noindex; disallowed in robots.txt; not linked from the site.
 */

const OWNER = "brettontaylor";
const GIST = "4cef9df3e05b168f5a69a2eceffc42e3";

export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = await fetch(`https://gist.githubusercontent.com/${OWNER}/${GIST}/raw/`, {
    next: { revalidate: 60 },
    headers: { accept: "text/html,text/plain" },
  });
  if (!upstream.ok) return new Response("Not found", { status: 404, headers: { "x-robots-tag": "noindex, nofollow" } });
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
