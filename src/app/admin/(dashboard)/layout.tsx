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
      <header className="flex items-center justify-between px-6 py-3 bg-dolipa-ink text-dolipa-cream">
        <Link href="/admin/productos" className="font-serif text-lg">
          Dolipa Admin
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="opacity-70">{session.user.email}</span>
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
      <main className="px-6 py-8 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
