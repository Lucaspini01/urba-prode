import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Tira } from "@prisma/client";
import Link from "next/link";
import PredictionsForm from "./PredictionsForm";

const TIRAS: Tira[] = ["PRIMERA", "INTERMEDIA", "PRE_A", "PRE_B", "PRE_C", "PRE_D"];
const TIRA_LABELS: Record<Tira, string> = {
  PRIMERA: "Primera",
  INTERMEDIA: "Intermedia",
  PRE_A: "Pre A",
  PRE_B: "Pre B",
  PRE_C: "Pre C",
  PRE_D: "Pre D",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tira?: string }>;
}) {
  const session = await auth();
  const { tira: tiraParam } = await searchParams;
  const tira: Tira = TIRAS.includes(tiraParam as Tira) ? (tiraParam as Tira) : "PRIMERA";

  // Check which tiras have an active fecha
  const activeFechas = await prisma.fecha.findMany({
    where: { isActive: true },
    select: { tira: true },
  });
  const activeTiras = new Set(activeFechas.map((f) => f.tira));

  const fecha = await prisma.fecha.findFirst({
    where: { isActive: true, tira },
    include: {
      matches: {
        orderBy: { scheduledAt: "asc" },
        include: { homeTeam: true, awayTeam: true },
      },
    },
  });

  const predictions = session && fecha
    ? await prisma.prediction.findMany({
        where: { userId: parseInt(session.user.id), match: { fechaId: fecha.id } },
      })
    : [];

  const deadlinePassed = fecha?.deadline && new Date(fecha.deadline) < new Date();

  return (
    <div>
      {/* Tira tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TIRAS.map((t) => {
          const isSelected = t === tira;
          const hasActive = activeTiras.has(t);
          return (
            <Link
              key={t}
              href={`/?tira=${t}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-slate-900 text-white"
                  : hasActive
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              {TIRA_LABELS[t]}
              {hasActive && !isSelected && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-500 align-middle" />
              )}
            </Link>
          );
        })}
      </div>

      {!fecha ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl mb-5 shadow-sm">
            🏉
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No hay fecha activa</h2>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            El administrador todavía no activó una fecha para {TIRA_LABELS[tira]}. Volvé pronto para hacer tus predicciones.
          </p>
        </div>
      ) : (
        <>
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
                  : `⏳ Cierra: ${new Date(fecha.deadline).toLocaleString("es-AR", { timeZone: "America/Buenos_Aires", hour12: false })}`}
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
        </>
      )}
    </div>
  );
}
