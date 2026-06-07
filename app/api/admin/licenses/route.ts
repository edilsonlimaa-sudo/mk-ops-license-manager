import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeMkAuthAddress } from "@/lib/normalize";
import { addDays } from "date-fns";

// Schema for creating/updating licenses
const licenseSchema = z.object({
  mkAuthAddress: z.string().min(1, "mkAuthAddress is required"),
  clientName: z.string().min(1, "Client name is required"),
  cnpj: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  monthlyValue: z.number().positive().optional(),
  billingDay: z.number().min(1).max(31).optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// GET /api/admin/licenses - List with filters
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const expiring = searchParams.get("expiring"); // "true" to filter expiring soon

  const where: any = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: "insensitive" } },
      { mkAuthAddress: { contains: search, mode: "insensitive" } },
      { cnpj: { contains: search, mode: "insensitive" } },
    ];
  }

  if (expiring === "true") {
    const now = new Date();
    const next7Days = addDays(now, 7);
    where.status = "active";
    where.expiresAt = { lte: next7Days, gte: now };
  }

  const licenses = await db.license.findMany({
    where,
    orderBy: [{ expiresAt: "asc" }, { clientName: "asc" }],
  });

  return NextResponse.json(licenses);
}

// POST /api/admin/licenses - Create new license
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = licenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const normalizedAddress = normalizeMkAuthAddress(data.mkAuthAddress);

  // Check if already exists
  const existing = await db.license.findUnique({
    where: { mkAuthAddress: normalizedAddress },
  });

  if (existing) {
    return NextResponse.json(
      { error: "License already exists for this mk-auth address" },
      { status: 409 }
    );
  }

  // Default: expires in 30 days
  const expiresAt = data.expiresAt
    ? new Date(data.expiresAt)
    : addDays(new Date(), 30);

  const license = await db.license.create({
    data: {
      mkAuthAddress: normalizedAddress,
      clientName: data.clientName,
      cnpj: data.cnpj,
      billingEmail: data.billingEmail || null,
      phone: data.phone,
      address: data.address,
      monthlyValue: data.monthlyValue,
      billingDay: data.billingDay,
      notes: data.notes,
      status: "active",
      activatedAt: new Date(),
      expiresAt,
    },
  });

  return NextResponse.json(license, { status: 201 });
}
