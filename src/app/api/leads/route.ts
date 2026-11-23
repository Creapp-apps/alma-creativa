import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/schemas";
import { saveLead } from "@/lib/leads";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo inválido" },
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Datos incompletos", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const lead = await saveLead(parsed.data);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar el pedido" },
      { status: 500 },
    );
  }
}
