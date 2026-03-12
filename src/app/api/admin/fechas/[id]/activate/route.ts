import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const fechaId = parseInt(id);

  // Desactivar todas, activar la seleccionada
  await prisma.$transaction([
    prisma.fecha.updateMany({ data: { isActive: false } }),
    prisma.fecha.update({ where: { id: fechaId }, data: { isActive: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
