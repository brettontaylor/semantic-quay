/**
 * POST /line-check/quote-engine-poc/api/quote — the POC's "agent door".
 * Accepts either a structured request or { request_text } and returns an illustrative offer.
 * Same engine the proposal page runs in the browser. No persistence, no auth.
 */
import { NextRequest } from "next/server";
import { agentQuote } from "@/lib/quote-engine/engine.mjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request", detail: "body must be JSON" }, 400);
  }
  try {
    return json(agentQuote(body as Record<string, unknown>), 200);
  } catch (e) {
    return json({ error: "bad request", detail: e instanceof Error ? e.message : String(e) }, 400);
  }
}

export function GET() {
  return json({ error: "method not allowed", hint: "POST a JSON request: { guests, date, budget_usd, dietary[] } or { request_text }" }, 405);
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json", "x-robots-tag": "noindex", "cache-control": "no-store", "x-poc": "agent-door" },
  });
}
