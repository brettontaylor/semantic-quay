// Mock data API with attribute-level access control. The SAME access policy the
// toolkit generates is enforced here, per request, by role. No paywall — masking
// is governed by data classification (sensitivity tier + PII + MNPI).
//
//   GET /api/v1/trade?role=trader
import { NextRequest } from "next/server";
import {
  getProduct,
  getRole,
  dataset,
  decide,
  MASK,
  policy,
  type AccessReason,
} from "@/app/developers/_reference";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params;
  const product = getProduct(entity);
  if (!product) {
    return Response.json(
      { error: `unknown data product "${entity}"`, available: Object.keys(dataset) },
      { status: 404 },
    );
  }

  const roleId = req.nextUrl.searchParams.get("role") ?? policy.defaultRole;
  const role = getRole(roleId);
  if (!role) {
    return Response.json(
      { error: `unknown role "${roleId}"`, roles: policy.roles.map((r) => r.role) },
      { status: 400 },
    );
  }

  const rows = (dataset[entity] ?? []).map((row) => {
    const out: Record<string, string | null> = {};
    for (const f of product.schema) {
      const d = decide(role, f);
      out[f.name] = d.visible ? (row[f.name] ?? null) : MASK;
    }
    return out;
  });

  const fields = product.schema.map((f) => {
    const d = decide(role, f);
    return {
      name: f.name,
      classification: f.classification,
      ...(f.pii ? { pii: true } : {}),
      ...(f.mnpi ? { mnpi: true } : {}),
      visible: d.visible,
      ...(d.reasons.length ? { maskedBy: d.reasons as AccessReason[] } : {}),
    };
  });

  return Response.json({
    entity,
    role: role.role,
    clearance: { maxTier: role.maxTier, pii: role.pii, mnpi: role.mnpi },
    count: rows.length,
    fields,
    rows,
  });
}
