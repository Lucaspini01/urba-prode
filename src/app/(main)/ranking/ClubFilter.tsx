"use client";

import { useRouter } from "next/navigation";

type Club = { id: number; shortName: string; name: string };

export default function ClubFilter({
  clubs,
  selected,
  fechaId,
}: {
  clubs: Club[];
  selected: number | null;
  fechaId: number | null;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Club</label>
      <select
        className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-600 transition-colors"
        value={selected ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams();
          if (e.target.value) params.set("club", e.target.value);
          if (fechaId) params.set("fecha", String(fechaId));
          const qs = params.toString();
          router.push(qs ? `/ranking?${qs}` : "/ranking");
        }}
      >
        <option value="">Todos</option>
        {clubs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.shortName} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
