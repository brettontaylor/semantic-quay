import { NextRequest } from "next/server";

/**
 * Unlisted brief pages.
 *
 * `/b/<gistId>` renders a single-file secret GitHub gist owned by the site's account as a
 * standalone HTML page. The content never lives in this (public) repo — only the gist id in
 * the URL identifies it, and secret gist ids are unguessable. Pages are served with
 * noindex/nofollow headers and are not linked from anywhere on the site.
 */

const OWNER = "brettontaylor";
const GIST_ID = /^[0-9a-f]{20,40}$/;

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ gist: string }> },
) {
  const { gist } = await ctx.params;
  if (!GIST_ID.test(gist)) return notFound();

  const upstream = await fetch(
    `https://gist.githubusercontent.com/${OWNER}/${gist}/raw/`,
    { next: { revalidate: 60 }, headers: { accept: "text/html,text/plain" } },
  );
  if (!upstream.ok) return notFound();

  const html = await upstream.text();
  if (!/<html[\s>]/i.test(html)) return notFound();

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
  return new Response("Not found", {
    status: 404,
    headers: { "x-robots-tag": "noindex, nofollow" },
  });
}
