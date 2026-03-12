"use client";

import { useState, useEffect } from "react";

type Club = { id: number; name: string; shortName: string };
type Fecha = { id: number; number: number; season: number };
type Match = {
  id: number;
  homeTeam: Club;
  awayTeam: Club;
  scheduledAt: string | null;
  isFinished: boolean;
};

export default function PartidosPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [fechas, setFechas] = useState<Fecha[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState({
    fechaId: "",
    homeTeamId: "",
    awayTeamId: "",
    scheduledAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    const [clubsRes, fechasRes] = await Promise.all([
      fetch("/api/clubs"),
      fetch("/api/admin/fechas"),
    ]);
    setClubs(await clubsRes.json());
    setFechas(await fechasRes.json());
  }

  async function loadMatches(fechaId: string) {
    if (!fechaId) return;
    const res = await fetch(`/api/admin/partidos?fechaId=${fechaId}`);
    setMatches(await res.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMatches(form.fechaId);
  }, [form.fechaId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.homeTeamId === form.awayTeamId) {
      setError("El local y visitante no pueden ser el mismo equipo.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/partidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fechaId: parseInt(form.fechaId),
        homeTeamId: parseInt(form.homeTeamId),
        awayTeamId: parseInt(form.awayTeamId),
        scheduledAt: form.scheduledAt || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error al crear partido.");
    } else {
      setForm({ ...form, homeTeamId: "", awayTeamId: "", scheduledAt: "" });
      loadMatches(form.fechaId);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Partidos</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Agregar partido</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <select
                className="input"
                value={form.fechaId}
                onChange={(e) => setForm({ ...form, fechaId: e.target.value })}
                required
              >
                <option value="">Seleccionar fecha...</option>
                {fechas.map((f) => (
                  <option key={f.id} value={f.id}>
                    Fecha {f.number} · {f.season}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                <select
                  className="input"
                  value={form.homeTeamId}
                  onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visitante
                </label>
                <select
                  className="input"
                  value={form.awayTeamId}
                  onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora (opcional)
              </label>
              <input
                className="input"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !form.fechaId}
              className="btn-primary w-full"
            >
              {loading ? "Creando..." : "Agregar partido"}
            </button>
          </form>
        </div>

        {/* Lista de partidos */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">
            Partidos {form.fechaId ? `(${matches.length})` : ""}
          </h2>
          {!form.fechaId ? (
            <p className="text-gray-400 text-sm">Seleccioná una fecha para ver sus partidos.</p>
          ) : matches.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay partidos para esta fecha.</p>
          ) : (
            <div className="space-y-2">
              {matches.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">
                    {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {m.scheduledAt && (
                      <span>{new Date(m.scheduledAt).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                    {m.isFinished && (
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">FIN</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
