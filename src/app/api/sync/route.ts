import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!db) {
    return Response.json(
      {
        available: false,
        reason: "Cloud sync is not configured. Data stays on this device.",
      },
      { status: 503 }
    );
  }
  return Response.json(
    {
      available: false,
      reason: "A sync worker is not enabled for this deployment.",
    },
    { status: 501 }
  );
}

export async function POST() {
  return GET();
}
