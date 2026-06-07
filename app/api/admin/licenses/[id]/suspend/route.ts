import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/admin/licenses/[id]/suspend
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const updated = await db.license.update({
    where: { id },
    data: { status: "suspended" },
  });

  return NextResponse.json(updated);
}
