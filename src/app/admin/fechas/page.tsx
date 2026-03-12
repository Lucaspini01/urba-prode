"use client";

import { useState, useEffect } from "react";

function toUTC(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours + 3, minutes)).toISOString();
}

function toAR(utc: string): string {
  return new Date(utc).toLocaleString("es-AR", { timeZone: "America/Buenos_Aires", hour12: false });
}

const TIRAS = ["PRIMERA", "INTERMEDIA", "PRE_A", "PRE_B", "PRE_C", "PRE_D"] as const;
type TiraKey = (typeof TIRAS)[number];

const TIRA_LABELS: Record<TiraKey, string> = {
  PRIMERA: "Primera",
  INTERMEDIA: "Intermedia",
  PRE_A: "Pre A",
  PRE_B: "Pre B",
  PRE_C: "Pre C",
  PRE_D: "Pre D",
};

type Fecha = {
  id: number;
  number: number;
  season: number;
  tira: TiraKey;
  isActive: boolean;
  deadline: string | null;
  _count: { matches: number };
};

export default function FechasPage() {
  const [fechas, setFechas] = useState<Fecha[]>([]);
  const [form, setForm] = useState({
    number: "",
    season: "2026",
    tira: "PRIMERA" as TiraKey,
    deadlineDate: "",
    deadlineTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Duplicate state: fechaId → set of selected target tiras
  const [duplicating, setDuplicating] = useState<number | null>(null);
  const [dupTiras, setDupTiras] = useState<Set<TiraKey>>(new Set());
  const [dupLoading, setDupLoading] = useState(false);
  const [dupMsg, setDupMsg] = useState("");

  async function load() {
    const r = await fetch("/api/admin/fechas");
    const data = await r.json();
    setFechas(data);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/fechas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: parseInt(form.number),
        season: parseInt(form.season),
        tira: form.tira,
        deadline: form.deadlineDate
          ? toUTC(form.deadlineDate, form.deadlineTime || "23:59")
          : null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error al crear fecha.");
    } else {
      setForm({ number: "", season: "2026", tira: "PRIMERA", deadlineDate: "", deadlineTime: "" });
      load();
    }
  }

  async function handleToggle(id: number, activate: boolean) {
    await fetch(`/api/admin/fechas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: activate }),
    });
    load();
  }

  async function handleDelete(id: number, number: number, tira: TiraKey) {
    if (!confirm(`¿Borrar Fecha ${number} (${TIRA_LABELS[tira]})? Se eliminarán todos sus partidos y predicciones.`)) return;
    await fetch(`/api/admin/fechas/${id}`, { method: "DELETE" });
    load();
  }

  function openDuplicate(f: Fecha) {
    setDuplicating(f.id);
    setDupTiras(new Set());
    setDupMsg("");
  }

  function toggleDupTira(tira: TiraKey) {
    setDupTiras((prev) => {
      const next = new Set(prev);
      if (next.has(tira)) next.delete(tira);
      else next.add(tira);
      return next;
    });
  }

  async function handleDuplicate(sourceFecha: Fecha) {
    if (dupTiras.size === 0) return;
    setDupLoading(true);
    setDupMsg("");

    const res = await fetch(`/api/admin/fechas/${sourceFecha.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetTiras: Array.from(dupTiras) }),
    });

    setDupLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setDupMsg(d.error || "Error al duplicar.");
    } else {
      const d = await res.json();
      setDupMsg(`✓ ${d.created} fecha${d.created !== 1 ? "s" : ""} creada${d.created !== 1 ? "s" : ""}`);
      setDupTiras(new Set());
      load();
      setTimeout(() => { setDuplicating(null); setDupMsg(""); }, 1500);
    }
  }

  // Group fechas by tira in desired order
  const grouped = TIRAS.map((tira) => ({
    tira,
    items: fechas.filter((f) => f.tira === tira).sort((a, b) => a.number - b.number),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Fechas</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Crear fecha */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Nueva fecha</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporada</label>
                <input
                  className="input"
                  type="number"
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tira</label>
              <select
                className="input"
                value={form.tira}
                onChange={(e) => setForm({ ...form, tira: e.target.value as TiraKey })}
                required
              >
                {TIRAS.map((t) => (
                  <option key={t} value={t}>{TIRA_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de cierre (opcional)
              </label>
              <input
                className="input"
                type="date"
                value={form.deadlineDate}
                onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de cierre <span className="text-gray-400">(por defecto 23:59)</span>
              </label>
              <input
                className="input"
                type="time"
                value={form.deadlineTime}
                onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
              />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creando..." : "Crear fecha"}
            </button>
          </form>
        </div>

        {/* Lista de fechas agrupadas por tira */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Fechas ({fechas.length})</h2>
          {fechas.length === 0 && (
            <p className="text-gray-400 text-sm">No hay fechas creadas.</p>
          )}
          <div className="space-y-4">
            {grouped.map(({ tira, items }) => (
              <div key={tira}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {TIRA_LABELS[tira]}
                </p>
                <div className="space-y-2">
                  {items.map((f) => (
                    <div key={f.id}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          f.isActive ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            Fecha {f.number} · {f.season}
                            {f.isActive && (
                              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                ACTIVA
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {f._count.matches} partidos ·{" "}
                            {f.deadline ? `Cierra ${toAR(f.deadline)}` : "Sin deadline"}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          <button
                            onClick={() => duplicating === f.id ? setDuplicating(null) : openDuplicate(f)}
                            className="text-xs py-1 px-2.5 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Duplicar
                          </button>
                          {f.isActive ? (
                            <button
                              onClick={() => handleToggle(f.id, false)}
                              className="btn-secondary text-xs py-1 px-2.5"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggle(f.id, true)}
                              className="btn-secondary text-xs py-1 px-2.5"
                            >
                              Activar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(f.id, f.number, f.tira)}
                            className="text-xs py-1 px-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>

                      {/* Panel de duplicar */}
                      {duplicating === f.id && (
                        <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-2">
                            Duplicar Fecha {f.number} a otras tiras:
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {TIRAS.filter((t) => t !== f.tira).map((t) => (
                              <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={dupTiras.has(t)}
                                  onChange={() => toggleDupTira(t)}
                                />
                                {TIRA_LABELS[t]}
                              </label>
                            ))}
                          </div>
                          {dupMsg && (
                            <p className={`text-xs mb-2 ${dupMsg.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>
                              {dupMsg}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDuplicate(f)}
                              disabled={dupLoading || dupTiras.size === 0}
                              className="btn-primary text-xs py-1 px-3"
                            >
                              {dupLoading ? "Duplicando..." : `Duplicar a ${dupTiras.size} tira${dupTiras.size !== 1 ? "s" : ""}`}
                            </button>
                            <button
                              onClick={() => setDuplicating(null)}
                              className="btn-secondary text-xs py-1 px-3"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
