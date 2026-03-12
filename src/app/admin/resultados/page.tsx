"use client";

import { useState, useEffect } from "react";

const TIRA_LABELS: Record<string, string> = {
  PRIMERA: "Primera", INTERMEDIA: "Intermedia",
  PRE_A: "Pre A", PRE_B: "Pre B", PRE_C: "Pre C", PRE_D: "Pre D",
};

type Club = { id: number; name: string; shortName: string };
type Fecha = { id: number; number: number; season: number; tira: string };
type Match = {
  id: number;
  homeTeam: Club;
  awayTeam: Club;
  scheduledAt: string | null;
  isFinished: boolean;
  homeScore: number | null;
  awayScore: number | null;
};

export default function ResultadosPage() {
  const [fechas, setFechas] = useState<Fecha[]>([]);
  const [selectedFecha, setSelectedFecha] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/api/admin/fechas").then((r) => r.json()).then(setFechas);
  }, []);

  useEffect(() => {
    if (!selectedFecha) return;
    fetch(`/api/admin/partidos?fechaId=${selectedFecha}`)
      .then((r) => r.json())
      .then((data: Match[]) => {
        setMatches(data);
        // Pre-fill existing scores
        const initial: Record<number, { home: string; away: string }> = {};
        data.forEach((m) => {
          initial[m.id] = {
            home: m.homeScore !== null ? String(m.homeScore) : "",
            away: m.awayScore !== null ? String(m.awayScore) : "",
          };
        });
        setScores(initial);
      });
  }, [selectedFecha]);

  async function handleSave(matchId: number) {
    const s = scores[matchId];
    if (!s || s.home === "" || s.away === "") return;

    setLoading((prev) => ({ ...prev, [matchId]: true }));
    setMessages((prev) => ({ ...prev, [matchId]: "" }));

    const res = await fetch("/api/admin/resultados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        homeScore: parseInt(s.home),
        awayScore: parseInt(s.away),
      }),
    });

    setLoading((prev) => ({ ...prev, [matchId]: false }));

    const data = await res.json();
    if (!res.ok) {
      setMessages((prev) => ({ ...prev, [matchId]: data.error || "Error" }));
    } else {
      setMessages((prev) => ({
        ...prev,
        [matchId]: `✓ Guardado · ${data.updated} predicciones calculadas`,
      }));
      // Refresh matches
      fetch(`/api/admin/partidos?fechaId=${selectedFecha}`)
        .then((r) => r.json())
        .then(setMatches);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Resultados</h1>

      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar fecha
        </label>
        <select
          className="input max-w-xs"
          value={selectedFecha}
          onChange={(e) => setSelectedFecha(e.target.value)}
        >
          <option value="">Elegir fecha...</option>
          {fechas.map((f) => (
            <option key={f.id} value={f.id}>
              {TIRA_LABELS[f.tira] ?? f.tira} — Fecha {f.number} · {f.season}
            </option>
          ))}
        </select>
      </div>

      {selectedFecha && matches.length === 0 && (
        <p className="text-gray-400">No hay partidos en esta fecha.</p>
      )}

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="card">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Partido */}
              <div className="font-semibold text-gray-800 min-w-0">
                {match.homeTeam.name} <span className="text-gray-400">vs</span>{" "}
                {match.awayTeam.name}
                {match.isFinished && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    FINALIZADO
                  </span>
                )}
              </div>

              {/* Score inputs */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 font-medium">
                    {match.homeTeam.shortName}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input w-16 text-center"
                    value={scores[match.id]?.home ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: {
                          ...prev[match.id],
                          home: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="input w-16 text-center"
                    value={scores[match.id]?.away ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: {
                          ...prev[match.id],
                          away: e.target.value,
                        },
                      }))
                    }
                  />
                  <label className="text-xs text-gray-500 font-medium">
                    {match.awayTeam.shortName}
                  </label>
                </div>

                <button
                  onClick={() => handleSave(match.id)}
                  disabled={
                    loading[match.id] ||
                    !scores[match.id]?.home ||
                    !scores[match.id]?.away
                  }
                  className="btn-primary text-sm py-1.5 px-4"
                >
                  {loading[match.id] ? "..." : "Guardar"}
                </button>
              </div>
            </div>

            {messages[match.id] && (
              <p
                className={`text-xs mt-2 ${
                  messages[match.id].startsWith("✓")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {messages[match.id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
