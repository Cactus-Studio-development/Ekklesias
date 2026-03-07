"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Toaster, toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Correo y contraseña son obligatorios");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success("Sesión iniciada");
      window.location.href = "/admin/dashboard";
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code === "auth/invalid-credential" || (err as { code: string }).code === "auth/user-not-found"
            ? "Correo o contraseña incorrectos"
            : "Error al iniciar sesión"
          : "Error al iniciar sesión";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <Toaster position="top-center" />
      <div className="admin-login__card">
        <h1 className="admin-login__title">Panel Admin</h1>
        <p className="admin-login__subtitle">Ekklesias</p>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-login__label">
            Correo
            <input
              type="email"
              className="admin-login__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ekklesias.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>
          <label className="admin-login__label">
            Contraseña
            <input
              type="password"
              className="admin-login__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </label>
          <button
            type="submit"
            className="admin-login__submit"
            disabled={loading}
          >
            {loading ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
        <p className="admin-login__footer">
          <Link href="/admin/registro" className="admin-login__back">
            Registrarse como administrador
          </Link>
        </p>
        <Link href="/" className="admin-login__back">
          ← Volver al sitio
        </Link>
      </div>
    </div>
  );
}
