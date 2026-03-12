"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Muestra el escudo de un club con 3 etapas de fallback:
 *   1. /clubs/images/[nombre].png  ← foto real del escudo (agregar acá)
 *   2. /clubs/[nombre].svg         ← SVG de color generado
 *   3. Círculo con abreviación     ← fallback de texto
 *
 * Convención de nombres: mismo nombre que el SVG pero con extensión .png
 *   Ej: /clubs/hurling.svg → /clubs/images/hurling.png
 */

type Props = {
  logoPath: string;       // ruta al SVG, e.g. "/clubs/hurling.svg"
  shortName: string;      // abreviación, e.g. "HUR"
  size: number;           // píxeles (ancho y alto)
  className?: string;     // clases para la imagen
  fallbackClassName?: string; // clases extra para el fallback de texto
};

function getPngPath(svgPath: string): string {
  return svgPath.replace("/clubs/", "/clubs/images/").replace(".svg", ".png");
}

export default function ClubImage({
  logoPath,
  shortName,
  size,
  className = "",
  fallbackClassName = "",
}: Props) {
  const [stage, setStage] = useState<"png" | "svg" | "text">("png");
  const pngPath = getPngPath(logoPath);

  if (stage === "text") {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-bold shrink-0 ${
          fallbackClassName || "bg-slate-200 text-slate-600 border border-slate-300"
        }`}
        style={{ width: size, height: size, fontSize: Math.floor(size * 0.28) }}
      >
        {shortName.slice(0, 3)}
      </div>
    );
  }

  return (
    <Image
      src={stage === "png" ? pngPath : logoPath}
      alt={shortName}
      width={size}
      height={size}
      className={`rounded-full object-contain shrink-0 ${className}`}
      onError={() => setStage(stage === "png" ? "svg" : "text")}
    />
  );
}
