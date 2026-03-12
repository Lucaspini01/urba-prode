import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import RankingTable from "@/components/RankingTable";
import FechaFilter from "./FechaFilter";

export const dynamic = "force-dynamic";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);

  const fechas = await prisma.fecha.findMany({
    orderBy: [{ season: "desc" }, { number: "asc" }],
  });

  const selectedFechaId = params.fecha ? parseInt(params.fecha) : null;

  const predGroups = await prisma.prediction.groupBy({
    by: ["userId"],
    where: {
      ...(selectedFechaId ? { match: { fechaId: selectedFechaId } } : {}),
      points: { not: null },
    },
    _sum: { points: true },
    _count: { id: true },
  });

  const userIds = predGroups.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: { club: true },
  });

  const entries = predGroups
    .map((g) => {
      const user = users.find((u) => u.id === g.userId);
      if (!user) return null;
      return {
        userId: user.id,
        username: user.username,
        clubLogo: user.club.logoPath,
        clubShortName: user.club.shortName,
        points: g._sum.points ?? 0,
        predictions: g._count.id,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => b.points - a.points)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const currentUserId = session ? parseInt(session.user.id) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ranking</h1>
        <FechaFilter fechas={fechas} selected={selectedFechaId} />
      </div>

      <div className="card">
        <RankingTable entries={entries} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
