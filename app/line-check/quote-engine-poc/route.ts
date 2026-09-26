/**
 * /line-check/quote-engine-poc — clickable proof of concept for the Line Check brief.
 * Static HTML (generated into page-html.ts) + assets under /public/line-check/quote-engine-poc.
 * The agent door lives at ./api/quote. Unlisted and noindex, like the brief.
 */
import { html } from "./page-html";

export const dynamic = "force-static";

export function GET() {
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow, noarchive",
      "cache-control": "no-store",
    },
  });
}
