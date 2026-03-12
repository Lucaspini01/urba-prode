import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Tira } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user.isAdmin) return null;
  return session;
}

// POST /api/admin/fechas/[id]/duplicate — duplicar a otras tiras
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const fechaId = parseInt(id);
  const { targetTiras } = await req.json();

  if (!targetTiras || !Array.isArray(targetTiras) || targetTiras.length === 0) {
    return NextResponse.json({ error: "Faltan tiras destino." }, { status: 400 });
  }

  const source = await prisma.fecha.findUnique({
    where: { id: fechaId },
    include: { matches: { select: { homeTeamId: true, awayTeamId: true, scheduledAt: true } } },
  });

  if (!source) return NextResponse.json({ error: "Fecha no encontrada." }, { status: 404 });

  const created = await Promise.all(
    targetTiras.map((tira: Tira) =>
      prisma.fecha.create({
        data: {
          number: source.number,
          season: source.season,
          tira,
          deadline: source.deadline,
          matches: {
            create: source.matches.map((m) => ({
              homeTeamId: m.homeTeamId,
              awayTeamId: m.awayTeamId,
              scheduledAt: m.scheduledAt,
            })),
          },
        },
      })
    )
  );

  return NextResponse.json({ ok: true, created: created.length });
}
