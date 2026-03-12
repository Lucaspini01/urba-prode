"use client";

import { useState, useEffect } from "react";

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

type Club = { id: number; name: string; shortName: string };
type Fecha = { id: number; number: number; season: number; tira: TiraKey };
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
  const [form, setForm] = useState({ fechaId: "", homeTeamId: "", awayTeamId: "", scheduledAt: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ homeTeamId: "", awayTeamId: "", scheduledAt: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

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

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadMatches(form.fechaId); }, [form.fechaId]);

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

  function openEdit(m: Match) {
    setEditingId(m.id);
    setEditForm({
      homeTeamId: String(m.homeTeam.id),
      awayTeamId: String(m.awayTeam.id),
      scheduledAt: m.scheduledAt
        ? new Date(m.scheduledAt).toISOString().slice(0, 16)
        : "",
    });
    setEditError("");
  }

  async function handleEdit(matchId: number) {
    if (editForm.homeTeamId === editForm.awayTeamId) {
      setEditError("El local y visitante no pueden ser el mismo.");
      return;
    }
    setEditLoading(true);
    setEditError("");

    const res = await fetch(`/api/admin/partidos/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeTeamId: parseInt(editForm.homeTeamId),
        awayTeamId: parseInt(editForm.awayTeamId),
        scheduledAt: editForm.scheduledAt || null,
      }),
    });

    setEditLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setEditError(d.error || "Error al guardar.");
    } else {
      setEditingId(null);
      loadMatches(form.fechaId);
    }
  }

  async function handleDelete(matchId: number, label: string) {
    if (!confirm(`¿Borrar partido ${label}? Se eliminarán sus predicciones.`)) return;
    await fetch(`/api/admin/partidos/${matchId}`, { method: "DELETE" });
    loadMatches(form.fechaId);
  }

  // Group fechas by tira for the dropdown
  const groupedFechas = TIRAS.map((tira) => ({
    tira,
    items: fechas.filter((f) => f.tira === tira).sort((a, b) => a.number - b.number),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Partidos</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Agregar partido</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <select
                className="input"
                value={form.fechaId}
                onChange={(e) => setForm({ ...form, fechaId: e.target.value })}
                required
              >
                <option value="">Seleccionar fecha...</option>
                {groupedFechas.map(({ tira, items }) => (
                  <optgroup key={tira} label={TIRA_LABELS[tira]}>
                    {items.map((f) => (
                      <option key={f.id} value={f.id}>
                        Fecha {f.number} · {f.season}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <select
                  className="input"
                  value={form.homeTeamId}
                  onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visitante</label>
                <select
                  className="input"
                  value={form.awayTeamId}
                  onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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

            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

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
                <div key={m.id}>
                  {editingId === m.id ? (
                    /* Formulario de edición inline */
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-0.5 block">Local</label>
                          <select
                            className="input text-sm py-1"
                            value={editForm.homeTeamId}
                            onChange={(e) => setEditForm({ ...editForm, homeTeamId: e.target.value })}
                          >
                            {clubs.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-0.5 block">Visitante</label>
                          <select
                            className="input text-sm py-1"
                            value={editForm.awayTeamId}
                            onChange={(e) => setEditForm({ ...editForm, awayTeamId: e.target.value })}
                          >
                            {clubs.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Fecha y hora</label>
                        <input
                          className="input text-sm py-1"
                          type="datetime-local"
                          value={editForm.scheduledAt}
                          onChange={(e) => setEditForm({ ...editForm, scheduledAt: e.target.value })}
                        />
                      </div>
                      {editError && <p className="text-red-600 text-xs">{editError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(m.id)}
                          disabled={editLoading}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          {editLoading ? "..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary text-xs py-1 px-3"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">
                          {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                        </span>
                        {m.scheduledAt && (
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(m.scheduledAt).toLocaleString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {m.isFinished && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">FIN</span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(m)}
                          className="text-xs py-1 px-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`)}
                          className="text-xs py-1 px-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
