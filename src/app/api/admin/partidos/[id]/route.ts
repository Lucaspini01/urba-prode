import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user.isAdmin) return null;
  return session;
}

// PATCH /api/admin/partidos/[id] — editar partido
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const matchId = parseInt(id);
  const { homeTeamId, awayTeamId, scheduledAt } = await req.json();

  if (homeTeamId === awayTeamId) {
    return NextResponse.json({ error: "Local y visitante no pueden ser el mismo." }, { status: 400 });
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeTeamId,
      awayTeamId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
    include: { homeTeam: true, awayTeam: true },
  });

  return NextResponse.json(match);
}

// DELETE /api/admin/partidos/[id] — borrar partido y sus predicciones
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const matchId = parseInt(id);

  await prisma.$transaction([
    prisma.prediction.deleteMany({ where: { matchId } }),
    prisma.match.delete({ where: { id: matchId } }),
  ]);

  return NextResponse.json({ ok: true });
}
