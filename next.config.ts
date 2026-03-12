import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permite logos locales y potencialmente externos en el futuro
    remotePatterns: [],
    // Deshabilitar optimización para imágenes locales de clubes
    unoptimized: true,
  },
};

export default nextConfig;
