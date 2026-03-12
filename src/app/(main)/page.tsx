import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PredictionsForm from "./PredictionsForm";

export default async function HomePage() {
  const session = await auth();

  const fecha = await prisma.fecha.findFirst({
    where: { isActive: true },
    include: {
      matches: {
        orderBy: { scheduledAt: "asc" },
        include: { homeTeam: true, awayTeam: true },
      },
    },
  });

  if (!fecha) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl mb-5 shadow-sm">
          🏉
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">No hay fecha activa</h2>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          El administrador todavía no activó una fecha. Volvé pronto para hacer tus predicciones.
        </p>
      </div>
    );
  }

  const predictions = session
    ? await prisma.prediction.findMany({
        where: { userId: parseInt(session.user.id), match: { fechaId: fecha.id } },
      })
    : [];

  const deadlinePassed = fecha.deadline && new Date(fecha.deadline) < new Date();

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Fecha {fecha.number}
            <span className="text-slate-400 font-normal text-xl ml-2">· {fecha.season}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {fecha.matches.length} partido{fecha.matches.length !== 1 ? "s" : ""}
          </p>
        </div>
        {fecha.deadline && (
          <span
            className={`text-sm font-semibold px-3 py-1.5 rounded-xl border ${
              deadlinePassed
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {deadlinePassed
              ? "⏰ Predicciones cerradas"
              : `⏳ Cierra: ${new Date(fecha.deadline).toLocaleString("es-AR")}`}
          </span>
        )}
      </div>

      {fecha.matches.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>No hay partidos cargados para esta fecha.</p>
          <p className="text-sm mt-1">Esperá que el admin agregue los partidos.</p>
        </div>
      ) : (
        <PredictionsForm
          matches={fecha.matches.map((m) => ({
            id: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            scheduledAt: m.scheduledAt?.toISOString() ?? null,
            isFinished: m.isFinished,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
          }))}
          initialPredictions={predictions.map((p) => ({
            matchId: p.matchId,
            pick: p.pick,
            margin: p.margin,
          }))}
          deadlinePassed={!!deadlinePassed}
          fechaId={fecha.id}
        />
      )}
    </div>
  );
}
