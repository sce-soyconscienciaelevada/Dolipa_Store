import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-y-2 px-4 sm:px-6 py-3 bg-dolipa-ink text-dolipa-cream">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/admin" className="font-serif text-base sm:text-lg">
            Dolipa Admin
          </Link>
          <nav className="flex items-center gap-2.5 sm:gap-4 text-xs sm:text-sm">
            <Link href="/admin" className="hover:underline">
              Inicio
            </Link>
            <Link href="/admin/productos" className="hover:underline">
              Productos
            </Link>
            <Link href="/admin/estadisticas" className="hover:underline">
              Estadísticas
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <span className="opacity-70 hidden sm:inline">{session.user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="underline">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-8 max-w-5xl mx-auto overflow-x-hidden">{children}</main>
    </div>
  );
}
