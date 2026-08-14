"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" action={formAction}>
        <h1>Entrar</h1>
        <p className="admin-login-sub">Área restrita do blog PuraVive.</p>

        <div className="field">
          <label className="field-label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        {state.error && <p className="field-error">{state.error}</p>}

        <button className="btn-store" type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
