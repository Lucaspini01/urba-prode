import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function PickBadge({ pick, homeShort, awayShort }: {
  pick: "HOME" | "AWAY" | "DRAW";
  homeShort: string;
  awayShort: string;
}) {
  if (pick === "HOME") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg">
        {homeShort} ←
      </span>
    );
  }
  if (pick === "AWAY") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-lg">
        → {awayShort}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">
      = Empate
    </span>
  );
}

function MarginBadge({ margin }: { margin: "MORE_7" | "LESS_7" }) {
  if (margin === "MORE_7") {
    return (
      <span className="inline-flex items-center text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-lg">
        &gt;7 pts
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-lg">
      ≤7 pts
    </span>
  );
}

function PointsBadge({ points }: { points: number }) {
  if (points === 5) return <span className="font-black text-base text-green-600 tabular-nums">{points}</span>;
  if (points === 4) return <span className="font-black text-base text-blue-600 tabular-nums">{points}</span>;
  return <span className="font-bold text-base text-slate-300 tabular-nums">{points}</span>;
}

export default async function HistorialPage() {
  const session = await auth();
  if (!session) return null;

  const userId = parseInt(session.user.id);

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: {
      match: { include: { homeTeam: true, awayTeam: true, fecha: true } },
    },
    orderBy: { match: { fecha: { number: "asc" } } },
  });

  const byFecha = predictions.reduce<
    Record<number, { fecha: { id: number; number: number; season: number }; preds: typeof predictions }>
  >((acc, p) => {
    const fid = p.match.fechaId;
    if (!acc[fid]) acc[fid] = { fecha: p.match.fecha, preds: [] };
    acc[fid].preds.push(p);
    return acc;
  }, {});

  const groups = Object.values(byFecha).sort((a, b) => b.fecha.number - a.fecha.number);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl mb-5 shadow-sm">
          📋
        </div>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Sin predicciones aún</h2>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          Participá en la fecha activa para ver tu historial aquí.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Mi historial</h1>

      <div className="space-y-8">
        {groups.map(({ fecha, preds }) => {
          const totalPoints = preds.reduce((s, p) => s + (p.points ?? 0), 0);
          const calculated = preds.some((p) => p.points !== null);
          const correctPicks = preds.filter((p) => p.points !== null && p.points > 0).length;

          return (
            <div key={fecha.id}>
              {/* Fecha header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-700">
                    Fecha {fecha.number}
                  </h2>
                  <span className="text-slate-400 text-sm">· {fecha.season}</span>
                </div>
                {calculated ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {correctPicks}/{preds.length} acertados
                    </span>
                    <span className="text-base font-black text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-xl tabular-nums">
                      {totalPoints} pts
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    Pendiente de resultados
                  </span>
                )}
              </div>

              {/* Table */}
              <div className="card overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Partido</th>
                      <th className="px-4 py-3">Tu predicción</th>
                      <th className="px-4 py-3">Resultado</th>
                      <th className="px-4 py-3 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {preds.map((pred) => {
                      const m = pred.match;
                      const rowBg =
                        pred.points === 5
                          ? "bg-green-50/60"
                          : pred.points === 4
                          ? "bg-blue-50/60"
                          : pred.points === 0 && pred.points !== null
                          ? "bg-red-50/30"
                          : "";

                      return (
                        <tr key={pred.id} className={`transition-colors hover:bg-slate-50 ${rowBg}`}>
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <PickBadge
                                pick={pred.pick}
                                homeShort={m.homeTeam.shortName}
                                awayShort={m.awayTeam.shortName}
                              />
                              <MarginBadge margin={pred.margin} />
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {m.isFinished && m.homeScore !== null
                              ? `${m.homeScore} – ${m.awayScore}`
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {pred.points !== null ? (
                              <PointsBadge points={pred.points} />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
