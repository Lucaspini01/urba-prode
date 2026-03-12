"use client";

import { useState } from "react";
import ClubImage from "./ClubImage";

type Club = { id: number; name: string; shortName: string; logoPath: string };

type Match = {
  id: number;
  homeTeam: Club;
  awayTeam: Club;
  scheduledAt: string | null;
  isFinished: boolean;
  homeScore: number | null;
  awayScore: number | null;
};

export type PredictionInput = {
  matchId: number;
  pick: "HOME" | "AWAY" | "DRAW";
  margin: "MORE_7" | "LESS_7";
};

type Props = {
  match: Match;
  prediction?: PredictionInput;
  locked: boolean;
  onChange: (pred: PredictionInput) => void;
};

export default function MatchCard({ match, prediction, locked, onChange }: Props) {
  const pick = prediction?.pick;
  const margin = prediction?.margin;

  function setPick(p: "HOME" | "AWAY" | "DRAW") {
    onChange({ matchId: match.id, pick: p, margin: margin ?? "LESS_7" });
  }

  function setMargin(m: "MORE_7" | "LESS_7") {
    onChange({ matchId: match.id, pick: pick ?? "HOME", margin: m });
  }

  const date = match.scheduledAt
    ? new Date(match.scheduledAt).toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const isPredicted = pick !== undefined;

  return (
    <div
      className={`card flex flex-col gap-3 transition-all duration-200 ${
        locked
          ? "opacity-75"
          : isPredicted
          ? "ring-1 ring-green-600/30 hover:shadow-md hover:-translate-y-0.5"
          : "hover:shadow-md hover:-translate-y-0.5 ring-1 ring-transparent hover:ring-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between min-h-[24px]">
        {date ? (
          <span className="text-[11px] text-slate-400 font-medium">{date}</span>
        ) : (
          <span />
        )}
        {match.isFinished ? (
          <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">
            Final
          </span>
        ) : isPredicted && !locked ? (
          <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
            ✓ Predicho
          </span>
        ) : null}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <ClubImage
            logoPath={match.homeTeam.logoPath}
            shortName={match.homeTeam.shortName}
            size={64}
            className="bg-white ring-1 ring-slate-100 shadow-sm"
          />
          <span className="text-xs font-bold text-slate-700 text-center leading-tight max-w-[60px] truncate">
            {match.homeTeam.shortName}
          </span>
        </div>

        <div className="flex-shrink-0">
          {match.isFinished && match.homeScore !== null && match.awayScore !== null ? (
            <div className="bg-slate-900 rounded-2xl px-4 py-2.5 text-center shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white tabular-nums leading-none">
                  {match.homeScore}
                </span>
                <span className="text-slate-500 font-bold text-lg leading-none">–</span>
                <span className="text-2xl font-black text-white tabular-nums leading-none">
                  {match.awayScore}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                Final
              </p>
            </div>
          ) : (
            <span className="text-xs font-black text-slate-300 tracking-widest">VS</span>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1.5">
          <ClubImage
            logoPath={match.awayTeam.logoPath}
            shortName={match.awayTeam.shortName}
            size={64}
            className="bg-white ring-1 ring-slate-100 shadow-sm"
          />
          <span className="text-xs font-bold text-slate-700 text-center leading-tight max-w-[60px] truncate">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Pick */}
      <div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5 text-center">
          ¿Quién gana?
        </p>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(["HOME", "DRAW", "AWAY"] as const).map((p) => {
            const label =
              p === "HOME"
                ? match.homeTeam.shortName
                : p === "AWAY"
                ? match.awayTeam.shortName
                : "Empate";
            const isSelected = pick === p;
            return (
              <label
                key={p}
                className={`flex-1 text-center text-xs py-2 rounded-lg font-medium transition-all duration-150 ${
                  locked ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-white shadow-sm text-green-800 font-bold ring-1 ring-green-700/20"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name={`pick-${match.id}`}
                  value={p}
                  checked={isSelected}
                  onChange={() => !locked && setPick(p)}
                  disabled={locked}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Margin */}
      <div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5 text-center">
          ¿Por cuánto?
        </p>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(["LESS_7", "MORE_7"] as const).map((m) => {
            const label = m === "LESS_7" ? "≤ 7 pts" : "> 7 pts";
            const isSelected = margin === m;
            return (
              <label
                key={m}
                className={`flex-1 text-center text-xs py-2 rounded-lg font-medium transition-all duration-150 ${
                  locked ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-white shadow-sm text-amber-700 font-bold ring-1 ring-amber-500/20"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name={`margin-${match.id}`}
                  value={m}
                  checked={isSelected}
                  onChange={() => !locked && setMargin(m)}
                  disabled={locked}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {locked && (
        <p className="text-[10px] text-center text-slate-400 italic">
          {match.isFinished ? "Partido finalizado" : "Predicciones cerradas"}
        </p>
      )}
    </div>
  );
}
