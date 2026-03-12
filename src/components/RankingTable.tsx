"use client";

import ClubImage from "./ClubImage";

type RankingEntry = {
  rank: number;
  userId: number;
  username: string;
  clubLogo: string;
  clubShortName: string;
  points: number;
  predictions: number;
};

const RANK_LABELS: Record<number, { icon: string; bar: string; text: string; height: string }> = {
  1: { icon: "🥇", bar: "bg-gradient-to-t from-yellow-500 to-yellow-300", text: "text-yellow-700", height: "h-20" },
  2: { icon: "🥈", bar: "bg-gradient-to-t from-slate-400 to-slate-300", text: "text-slate-600", height: "h-14" },
  3: { icon: "🥉", bar: "bg-gradient-to-t from-amber-700 to-amber-500", text: "text-amber-700", height: "h-10" },
};

export default function RankingTable({
  entries,
  currentUserId,
}: {
  entries: RankingEntry[];
  currentUserId?: number | null;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-slate-400 py-8">
        No hay datos de ranking todavía.
      </p>
    );
  }

  const podium = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <div>
      {/* Podio top 3 */}
      {podium.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-8 pb-6 border-b border-slate-100">
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry) => {
            const isMe = entry.userId === currentUserId;
            const r = RANK_LABELS[entry.rank];
            const logoSize = entry.rank === 1 ? 52 : 40;
            return (
              <div
                key={entry.userId}
                className={`flex flex-col items-center gap-1.5 ${entry.rank === 1 ? "scale-105" : ""}`}
              >
                <ClubImage
                  logoPath={entry.clubLogo}
                  shortName={entry.clubShortName}
                  size={logoSize}
                  className="ring-2 ring-white shadow-md"
                />
                <span className={`text-xs font-bold truncate max-w-[72px] text-center ${isMe ? "text-green-700" : "text-slate-700"}`}>
                  {isMe ? "Vos" : entry.username}
                </span>
                <span className={`text-sm font-black ${r.text}`}>
                  {entry.points} pts
                </span>
                <div className={`w-16 flex items-start justify-center pt-2 rounded-t-xl ${r.bar} ${r.height}`}>
                  <span className="text-xl">{r.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabla completa */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="pb-3 pr-3 pl-1">#</th>
              <th className="pb-3 pr-3">Club</th>
              <th className="pb-3 flex-1">Usuario</th>
              <th className="pb-3 text-right">Pred.</th>
              <th className="pb-3 text-right pl-4">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.map((entry) => {
              const isMe = entry.userId === currentUserId;
              return (
                <tr
                  key={entry.userId}
                  className={`transition-colors ${
                    isMe ? "bg-green-50 hover:bg-green-100/70" : "hover:bg-slate-50"
                  } ${entry.rank <= 3 ? "font-semibold" : ""}`}
                >
                  <td className="py-3 pr-3 pl-1">
                    {entry.rank <= 3 ? (
                      <span className="text-lg leading-none">{RANK_LABELS[entry.rank].icon}</span>
                    ) : (
                      <span className="text-sm text-slate-400 font-medium tabular-nums">{entry.rank}</span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <ClubImage
                      logoPath={entry.clubLogo}
                      shortName={entry.clubShortName}
                      size={32}
                      className="ring-1 ring-slate-100"
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isMe ? "text-green-700 font-bold" : "text-slate-700"}`}>
                        {entry.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-md">
                          vos
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right text-slate-400 text-sm tabular-nums">
                    {entry.predictions}
                  </td>
                  <td className="py-3 text-right pl-4">
                    <span className="text-green-700 font-black text-base tabular-nums">
                      {entry.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
