import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const allClubs = await prisma.club.findMany({ orderBy: { name: "asc" } });
  // "Algun Otro" siempre al final
  const clubs = [
    ...allClubs.filter((c) => c.shortName !== "OTRO"),
    ...allClubs.filter((c) => c.shortName === "OTRO"),
  ];
  return NextResponse.json(clubs);
}
