"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await loginAction(formData);
    },
    undefined
  );

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <form action={action} className="w-full max-w-sm border border-black/10 rounded-lg p-8">
        <h1 className="font-serif text-2xl mb-6 text-center">Dolipa Store Admin</h1>
        <label className="text-sm font-medium block mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border border-black/20 rounded px-3 py-2 mb-4 text-sm"
        />
        <label className="text-sm font-medium block mb-1">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          className="w-full border border-black/20 rounded px-3 py-2 mb-4 text-sm"
        />
        {state?.error && <p className="text-sm text-red-600 mb-4">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-dolipa-ink text-dolipa-cream font-bold py-3 rounded text-sm uppercase tracking-wide disabled:opacity-50"
        >
          {pending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}
