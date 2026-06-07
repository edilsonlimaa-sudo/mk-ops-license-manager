import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays } from "date-fns";

export async function GET() {
  const now = new Date();
  const next7Days = addDays(now, 7);

  // Total counts by status
  const [active, expired, suspended, expiringSoon] = await Promise.all([
    db.license.count({ where: { status: "active", expiresAt: { gt: next7Days } } }),
    db.license.count({ where: { status: "expired" } }),
    db.license.count({ where: { status: "suspended" } }),
    db.license.count({
      where: {
        status: "active",
        expiresAt: { lte: next7Days, gte: now },
      },
    }),
  ]);

  // Licenses expiring soon (next 7 days)
  const expiringLicenses = await db.license.findMany({
    where: {
      status: "active",
      expiresAt: { lte: next7Days, gte: now },
    },
    orderBy: { expiresAt: "asc" },
    select: {
      id: true,
      mkAuthAddress: true,
      clientName: true,
      expiresAt: true,
      monthlyValue: true,
    },
  });

  // Recent validations (last 24h)
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentValidations = await db.validationLog.count({
    where: { validatedAt: { gte: last24h } },
  });

  return NextResponse.json({
    summary: {
      total: active + expired + suspended,
      active,
      expired,
      suspended,
      expiringSoon,
    },
    expiringLicenses,
    recentValidations,
  });
}
