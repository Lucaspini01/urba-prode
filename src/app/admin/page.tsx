import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [users, fechas, matches, predictions] = await Promise.all([
    prisma.user.count(),
    prisma.fecha.count(),
    prisma.match.count(),
    prisma.prediction.count(),
  ]);

  const activeFecha = await prisma.fecha.findFirst({
    where: { isActive: true },
    include: { matches: true },
  });

  const stats = [
    { label: "Usuarios", value: users, href: null },
    { label: "Fechas", value: fechas, href: "/admin/fechas" },
    { label: "Partidos", value: matches, href: "/admin/partidos" },
    { label: "Predicciones", value: predictions, href: null },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-3xl font-bold text-green-700">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            {s.href && (
              <Link
                href={s.href}
                className="text-xs text-green-600 hover:underline mt-2 inline-block"
              >
                Administrar →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Fecha activa */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3">Fecha activa</h2>
        {activeFecha ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">
                Fecha {activeFecha.number} · {activeFecha.season}
              </p>
              <p className="text-sm text-gray-500">
                {activeFecha.matches.length} partidos ·{" "}
                {activeFecha.deadline
                  ? `Cierra ${new Date(activeFecha.deadline).toLocaleString("es-AR")}`
                  : "Sin deadline"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/partidos" className="btn-secondary text-sm">
                + Partidos
              </Link>
              <Link href="/admin/resultados" className="btn-primary text-sm">
                Resultados
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-gray-400">No hay fecha activa.</p>
            <Link href="/admin/fechas" className="btn-primary text-sm">
              Crear fecha
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
