// Model registry API — list all registered models (BDM/PDM/semantic) with
// versions. Filter by kind: /api/v1/models?kind=bdm
import { NextRequest } from "next/server";
import { registry, listModels } from "@/app/developers/_reference";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind");
  let models = listModels();
  if (kind) models = models.filter((m) => m.kind === kind);
  return Response.json({
    standardVersion: registry.standardVersion,
    counts: registry.counts,
    count: models.length,
    models: models.map((m) => ({
      id: m.id,
      kind: m.kind,
      version: m.version,
      status: m.status,
      dependsOn: m.dependsOn,
    })),
  });
}
