"use client";

import Image from "next/image";
import { useState } from "react";

type Club = { id: number; name: string; shortName: string; logoPath: string };

type Props = {
  clubs: Club[];
  selected: number;
  onSelect: (id: number) => void;
};

function ClubLogo({ club, size }: { club: Club; size: number }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-green-800 text-white font-bold"
        style={{ width: size, height: size, fontSize: size * 0.28 }}
      >
        {club.shortName.slice(0, 3)}
      </div>
    );
  }

  return (
    <Image
      src={club.logoPath}
      alt={club.name}
      width={size}
      height={size}
      className="object-contain rounded-full"
      onError={() => setError(true)}
    />
  );
}

export default function ClubSelector({ clubs, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {clubs.map((club) => (
        <button
          key={club.id}
          type="button"
          onClick={() => onSelect(club.id)}
          title={club.name}
          className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
            selected === club.id
              ? "border-green-700 bg-green-50 shadow-md scale-105"
              : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <ClubLogo club={club} size={44} />
          <span className="text-xs text-center mt-1 leading-tight text-gray-600 font-medium">
            {club.shortName}
          </span>
        </button>
      ))}
    </div>
  );
}
