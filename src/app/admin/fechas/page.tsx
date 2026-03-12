"use client";

import { useState, useEffect } from "react";

type Fecha = {
  id: number;
  number: number;
  season: number;
  isActive: boolean;
  deadline: string | null;
  _count: { matches: number };
};

export default function FechasPage() {
  const [fechas, setFechas] = useState<Fecha[]>([]);
  const [form, setForm] = useState({
    number: "",
    season: "2026",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/admin/fechas");
    const data = await r.json();
    setFechas(data);
  }

  useEffect(() => {
    load();
  }, []);

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
        deadline: form.deadline || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error al crear fecha.");
    } else {
      setForm({ number: "", season: "2026", deadline: "" });
      load();
    }
  }

  async function handleActivate(id: number) {
    await fetch(`/api/admin/fechas/${id}/activate`, { method: "POST" });
    load();
  }

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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporada
                </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline (opcional)
              </label>
              <input
                className="input"
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creando..." : "Crear fecha"}
            </button>
          </form>
        </div>

        {/* Lista de fechas */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">
            Fechas ({fechas.length})
          </h2>
          <div className="space-y-2">
            {fechas.length === 0 && (
              <p className="text-gray-400 text-sm">No hay fechas creadas.</p>
            )}
            {fechas.map((f) => (
              <div
                key={f.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  f.isActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div>
                  <p className="font-medium">
                    Fecha {f.number} · {f.season}
                    {f.isActive && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                        ACTIVA
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {f._count.matches} partidos ·{" "}
                    {f.deadline
                      ? `Cierra ${new Date(f.deadline).toLocaleString("es-AR")}`
                      : "Sin deadline"}
                  </p>
                </div>
                {!f.isActive && (
                  <button
                    onClick={() => handleActivate(f.id)}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Activar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
