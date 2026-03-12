import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user.isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const fechas = await prisma.fecha.findMany({
    orderBy: [{ season: "desc" }, { number: "asc" }],
    include: { _count: { select: { matches: true } } },
  });

  return NextResponse.json(fechas);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { number, season, tira, deadline } = await req.json();

  if (!number || !season || !tira) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  const fecha = await prisma.fecha.create({
    data: {
      number,
      season,
      tira,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return NextResponse.json(fecha, { status: 201 });
}
