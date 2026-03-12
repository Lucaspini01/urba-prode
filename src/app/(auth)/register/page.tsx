"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClubImage from "@/components/ClubImage";

type Club = { id: number; name: string; shortName: string; logoPath: string };

function RugbyBallIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
      <ellipse cx="32" cy="32" rx="20" ry="12" transform="rotate(-35 32 32)"
        fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.9)" strokeWidth="2"/>
      <line x1="20" y1="20" x2="44" y2="44" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="25" y1="17" x2="27" y2="24" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="37" y1="40" x2="39" y2="47" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="40" y1="25" x2="47" y2="27" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="17" y1="37" x2="24" y2="39" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", clubId: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clubs").then((r) => r.json()).then(setClubs);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.clubId === 0) {
      setError("Seleccioná tu club.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username, password: form.password, clubId: form.clubId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al registrarse.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(135deg, #064e25 0%, #006633 50%, #004d26 100%)" }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${12 + i * 11}%` }} />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-800 rounded-2xl mb-4 shadow-lg">
              <RugbyBallIcon />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear cuenta</h1>
            <p className="text-green-700 text-sm font-semibold mt-0.5">Prode URBA · Primera A 2026</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-800 text-white text-xs font-black">1</span>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tus datos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Usuario</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="min. 3 caracteres"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required minLength={3} maxLength={20} autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="min. 6 caracteres"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required minLength={6}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar contraseña</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="repetí la contraseña"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-800 text-white text-xs font-black">2</span>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Elegí tu club</h2>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {clubs.map((club) => (
                  <button
                    key={club.id}
                    type="button"
                    onClick={() => setForm({ ...form, clubId: club.id })}
                    className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all duration-150 ${
                      form.clubId === club.id
                        ? "border-green-700 bg-green-50 shadow-md scale-105"
                        : "border-slate-200 hover:border-green-300 hover:bg-green-50/50"
                    }`}
                  >
                    <ClubImage logoPath={club.logoPath} shortName={club.shortName} size={44} />
                    <span className="text-[10px] text-center mt-1 leading-tight text-slate-600 font-semibold">
                      {club.shortName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-green-700 font-bold hover:underline">Ingresá</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
