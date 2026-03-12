import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { username, password, clubId } = await req.json();

  if (!username || !password || !clubId) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json(
      { error: "El usuario debe tener entre 3 y 20 caracteres." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { error: "Ese nombre de usuario ya está en uso." },
      { status: 409 }
    );
  }

  const clubExists = await prisma.club.findUnique({ where: { id: clubId } });
  if (!clubExists) {
    return NextResponse.json({ error: "Club inválido." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, password: hashed, clubId },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
