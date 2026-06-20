// Single model — full record incl. version, signature, dependencies, detail.
//   GET /api/v1/models/trade_physical
import { getModel, listModels } from "@/app/developers/_reference";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) {
    return Response.json(
      { error: `unknown model "${id}"`, models: listModels().map((m) => m.id) },
      { status: 404 },
    );
  }
  return Response.json(model);
}
