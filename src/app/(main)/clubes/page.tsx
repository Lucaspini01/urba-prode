import { prisma } from "@/lib/db";
import ClubImage from "@/components/ClubImage";

export const dynamic = "force-dynamic";

export default async function ClubesPage() {
  const clubs = await prisma.club.findMany({
    where: { shortName: { not: "OTRO" } },
    include: { _count: { select: { users: { where: { isAdmin: false } } } } },
    orderBy: { name: "asc" },
  });

  const sorted = [...clubs].sort((a, b) => b._count.users - a._count.users);
  const total = sorted.reduce((acc, c) => acc + c._count.users, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clubes</h1>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Cantidad de Hinchas
          <span className="ml-2 text-sm font-normal text-slate-500">({total} jugadores)</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {sorted.map((club, i) => {
            const pct = total > 0 ? (club._count.users / total) * 100 : 0;

            return (
              <div key={club.id} className="flex items-center gap-4 py-3">
                <span className="w-6 text-right text-sm font-medium text-slate-400 shrink-0">
                  {i + 1}
                </span>

                <ClubImage logoPath={club.logoPath} shortName={club.shortName} size={36} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{club.name}</span>
                    <span className="text-sm font-semibold ml-3 shrink-0">
                      {club._count.users}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
