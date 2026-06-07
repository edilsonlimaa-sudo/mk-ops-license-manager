import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays } from "date-fns";

// POST /api/admin/licenses/[id]/renew
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const license = await db.license.findUnique({ where: { id } });

  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  // Extend by 30 days from current expiresAt (or now if expired)
  const baseDate = license.expiresAt && license.expiresAt > new Date()
    ? license.expiresAt
    : new Date();

  const newExpiresAt = addDays(baseDate, 30);

  const updated = await db.license.update({
    where: { id },
    data: {
      expiresAt: newExpiresAt,
      status: "active", // Reactivate if was expired
    },
  });

  return NextResponse.json(updated);
}
