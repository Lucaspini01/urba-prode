import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user.isAdmin) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const fechaId = req.nextUrl.searchParams.get("fechaId");
  if (!fechaId) return NextResponse.json({ error: "Missing fechaId" }, { status: 400 });

  const matches = await prisma.match.findMany({
    where: { fechaId: parseInt(fechaId) },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { fechaId, homeTeamId, awayTeamId, scheduledAt } = await req.json();

  if (!fechaId || !homeTeamId || !awayTeamId) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  if (homeTeamId === awayTeamId) {
    return NextResponse.json(
      { error: "Local y visitante no pueden ser el mismo." },
      { status: 400 }
    );
  }

  const match = await prisma.match.create({
    data: {
      fechaId,
      homeTeamId,
      awayTeamId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
    include: { homeTeam: true, awayTeam: true },
  });

  return NextResponse.json(match, { status: 201 });
}
