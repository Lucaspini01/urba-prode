"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ClubImage from "./ClubImage";

type NavbarProps = {
  username: string;
  clubLogo: string;
  clubShortName: string;
  isAdmin: boolean;
};

export default function Navbar({ username, clubLogo, clubShortName, isAdmin }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Predicciones" },
    { href: "/ranking", label: "Ranking" },
    { href: "/historial", label: "Historial" },
    { href: "/clubes", label: "Clubes" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-green-900/95 backdrop-blur-md text-white shadow-lg border-b border-green-800/60">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Brand + Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-base tracking-tight flex items-center gap-2">
            <span className="text-green-300 text-lg">🏉</span>
            <span>Prode URBA</span>
          </Link>

          <div className="hidden sm:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.href)
                    ? "bg-white/15 text-white"
                    : "text-green-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <span className="w-px h-4 bg-green-700 mx-1.5" />
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 ${
                    pathname.startsWith("/admin")
                      ? "bg-yellow-400 text-green-900"
                      : "text-yellow-300 hover:bg-yellow-400/20 hover:text-yellow-200"
                  }`}
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {isAdmin && (
              <span className="text-[10px] font-black bg-yellow-400 text-green-900 px-1.5 py-0.5 rounded tracking-wide">
                ADMIN
              </span>
            )}
            <span className="text-sm text-green-200 font-medium">{username}</span>
          </div>

          <span className="hidden sm:block w-px h-5 bg-green-700/80" />

          <ClubImage
            logoPath={clubLogo}
            shortName={clubShortName}
            size={32}
            className="bg-white ring-2 ring-white/30"
            fallbackClassName="bg-white/20 text-white border border-white/30"
          />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-green-300 hover:text-white transition-colors font-medium"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-green-800/60 px-4 pb-2 pt-1 flex gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 text-center px-2 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive(link.href)
                ? "bg-white/15 text-white"
                : "text-green-200 hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex-1 text-center px-2 py-1.5 rounded-lg text-sm font-bold transition-all ${
              pathname.startsWith("/admin")
                ? "bg-yellow-400 text-green-900"
                : "text-yellow-300 hover:bg-yellow-400/20"
            }`}
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
}
