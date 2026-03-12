import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import RankingTable from "@/components/RankingTable";
import FechaFilter from "./FechaFilter";
import ClubFilter from "./ClubFilter";

export const dynamic = "force-dynamic";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; club?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);

  const selectedFechaId = params.fecha ? parseInt(params.fecha) : null;
  const selectedClubId = params.club ? parseInt(params.club) : null;

  const [fechas, clubs] = await Promise.all([
    prisma.fecha.findMany({ orderBy: [{ season: "desc" }, { number: "asc" }] }),
    prisma.club.findMany({ orderBy: { name: "asc" } }),
  ]);

  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
      ...(selectedClubId ? { clubId: selectedClubId } : {}),
    },
    include: { club: true },
  });

  const predGroups = await prisma.prediction.groupBy({
    by: ["userId"],
    where: {
      ...(selectedFechaId ? { match: { fechaId: selectedFechaId } } : {}),
      points: { not: null },
    },
    _sum: { points: true },
    _count: { id: true },
  });

  const pointsMap = new Map(
    predGroups.map((g) => [g.userId, { points: g._sum.points ?? 0, predictions: g._count.id }])
  );

  const entries = users
    .map((user) => {
      const stats = pointsMap.get(user.id) ?? { points: 0, predictions: 0 };
      return {
        userId: user.id,
        username: user.username,
        clubLogo: user.club.logoPath,
        clubShortName: user.club.shortName,
        points: stats.points,
        predictions: stats.predictions,
      };
    })
    .sort((a, b) => b.points - a.points)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const currentUserId = session ? parseInt(session.user.id) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Ranking</h1>
        <div className="flex flex-wrap gap-3">
          <ClubFilter clubs={clubs} selected={selectedClubId} fechaId={selectedFechaId} />
          <FechaFilter fechas={fechas} selected={selectedFechaId} clubId={selectedClubId} />
        </div>
      </div>

      <div className="card">
        <RankingTable entries={entries} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
