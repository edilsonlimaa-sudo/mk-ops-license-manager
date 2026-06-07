import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeMkAuthAddress } from "@/lib/normalize";
import { calculateGracePeriodEnd, computeValid, isInGracePeriod } from "@/lib/license-utils";
import type { LicenseValidationResponse, LicenseStatus } from "@/types/license";

const requestSchema = z.object({
  mkAuthAddress: z.string().min(1, "mkAuthAddress is required"),
});

export async function POST(req: NextRequest) {
  // Parse + validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bad request", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const mkAuthAddress = normalizeMkAuthAddress(parsed.data.mkAuthAddress);

  // Look up license in the database
  const license = await db.license.findUnique({
    where: { mkAuthAddress },
  });

  let response: LicenseValidationResponse;

  if (!license) {
    response = {
      valid: false,
      status: "not_found",
      reason: "not_found",
    };
  } else {
    const status = license.status as LicenseStatus;
    const expiresAt = license.expiresAt;
    const valid = computeValid(status, expiresAt);

    if (status === "suspended") {
      response = {
        valid: false,
        status: "suspended",
        reason: "suspended",
        clientName: license.clientName,
        expiresAt: expiresAt?.toISOString(),
        gracePeriodEndsAt: expiresAt
          ? calculateGracePeriodEnd(expiresAt).toISOString()
          : undefined,
      };
    } else if (status === "expired" || (status === "active" && expiresAt && expiresAt < new Date())) {
      // expired (with or without grace)
      const inGrace = expiresAt ? isInGracePeriod(expiresAt) : false;
      response = {
        valid: inGrace,
        status: "expired",
        reason: inGrace ? undefined : "expired",
        clientName: license.clientName,
        expiresAt: expiresAt?.toISOString(),
        gracePeriodEndsAt: expiresAt
          ? calculateGracePeriodEnd(expiresAt).toISOString()
          : undefined,
      };
    } else {
      // active
      response = {
        valid: true,
        status: "active",
        clientName: license.clientName,
        expiresAt: expiresAt?.toISOString(),
        gracePeriodEndsAt: expiresAt
          ? calculateGracePeriodEnd(expiresAt).toISOString()
          : undefined,
      };
    }
  }

  // Fire-and-forget audit log (does not block response)
  db.validationLog
    .create({
      data: {
        mkAuthAddress,
        result: response.valid,
        status: response.status,
      },
    })
    .catch((err) => console.error("[audit] Failed to write validation log:", err));

  return NextResponse.json(response);
}
