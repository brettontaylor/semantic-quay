// Lightweight health endpoint for Railway's deploy health check.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", service: "semantic-quay" });
}
