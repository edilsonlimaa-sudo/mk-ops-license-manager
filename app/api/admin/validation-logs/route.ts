import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/validation-logs
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const mkAuthAddress = searchParams.get("mkAuthAddress");

  const skip = (page - 1) * limit;

  const where: any = {};
  if (mkAuthAddress) {
    where.mkAuthAddress = { contains: mkAuthAddress, mode: "insensitive" };
  }

  const [logs, total] = await Promise.all([
    db.validationLog.findMany({
      where,
      orderBy: { validatedAt: "desc" },
      take: limit,
      skip,
    }),
    db.validationLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
