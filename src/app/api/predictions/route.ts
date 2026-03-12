import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/predictions?fechaId=X
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fechaId = req.nextUrl.searchParams.get("fechaId");
  if (!fechaId) return NextResponse.json({ error: "Missing fechaId" }, { status: 400 });

  const predictions = await prisma.prediction.findMany({
    where: {
      userId: parseInt(session.user.id),
      match: { fechaId: parseInt(fechaId) },
    },
  });

  return NextResponse.json(predictions);
}

// POST /api/predictions  { predictions: [{matchId, pick, margin}] }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { predictions } = await req.json();
  if (!Array.isArray(predictions) || predictions.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const userId = parseInt(session.user.id);
  const results = [];

  for (const pred of predictions) {
    const { matchId, pick, margin } = pred;

    // Validate match exists and is not finished / deadline passed
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { fecha: true },
    });

    if (!match || match.isFinished) continue;
    if (match.fecha.deadline && new Date(match.fecha.deadline) < new Date()) continue;

    const saved = await prisma.prediction.upsert({
      where: { userId_matchId: { userId, matchId } },
      update: { pick, margin },
      create: { userId, matchId, pick, margin },
    });

    results.push(saved);
  }

  return NextResponse.json({ saved: results.length });
}
