import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user.isAdmin) {
    redirect("/");
  }

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/fechas", label: "Fechas" },
    { href: "/admin/partidos", label: "Partidos" },
    { href: "/admin/resultados", label: "Resultados" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg">
              <span className="text-yellow-400">Admin</span> · URBA Prode
            </span>
            <nav className="hidden sm:flex gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden bg-gray-800 px-4 py-2 flex gap-1 overflow-x-auto">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:bg-gray-700 whitespace-nowrap"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
