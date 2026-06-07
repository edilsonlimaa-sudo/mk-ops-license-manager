import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeMkAuthAddress } from "@/lib/normalize";

const licenseUpdateSchema = z.object({
  clientName: z.string().min(1).optional(),
  cnpj: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  monthlyValue: z.number().positive().optional().nullable(),
  billingDay: z.number().min(1).max(31).optional().nullable(),
  notes: z.string().optional(),
  status: z.enum(["active", "expired", "suspended"]).optional(),
  expiresAt: z.string().datetime().optional(),
});

// GET /api/admin/licenses/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const license = await db.license.findUnique({
    where: { id },
  });

  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  // Fetch validation logs separately (no FK relation)
  const validationLogs = await db.validationLog.findMany({
    where: { mkAuthAddress: license.mkAuthAddress },
    orderBy: { validatedAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ ...license, validationLogs });
}

// PUT /api/admin/licenses/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = licenseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateData: any = { ...data };

  if (data.expiresAt) {
    updateData.expiresAt = new Date(data.expiresAt);
  }

  if (data.billingEmail === "") {
    updateData.billingEmail = null;
  }

  const license = await db.license.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(license);
}

// DELETE /api/admin/licenses/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.license.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
