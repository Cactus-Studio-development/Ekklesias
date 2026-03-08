"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, FUNCTIONS_URL } from "@/lib/firebase";
import { Toaster, toast } from "sonner";
import Link from "next/link";

export default function AdminRegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Correo y contraseña son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const token = await userCred.user.getIdToken();
      const res = await fetch(`${FUNCTIONS_URL}/registerAdmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error === "invalid_invite_code" ? "Código de invitación incorrecto" : "No se pudo completar el registro");
        setLoading(false);
        return;
      }
      toast.success("Registro completo");
      window.location.href = "/admin/dashboard";
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "";
      let msg = "Error al crear la cuenta";
      if (code === "auth/email-already-in-use") msg = "Ese correo ya está registrado";
      else if (code === "auth/operation-not-allowed") msg = "Inicio con correo/contraseña no está habilitado. Actívalo en Firebase Console > Authentication > Sign-in method.";
      else if (code === "auth/network-request-failed") msg = "Error de red. Comprueba la conexión.";
      else if (code === "auth/weak-password") msg = "La contraseña es demasiado débil.";
      else if (message.includes("fetch") || message.includes("Failed to fetch")) msg = "No se pudo conectar con el servidor. Si usas emulador local, configura NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL en .env.local.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <Toaster position="top-center" />
      <div className="admin-login__card">
        <h1 className="admin-login__title">Registro de administrador</h1>
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
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              disabled={loading}
            />
          </label>
          <label className="admin-login__label">
            Confirmar contraseña
            <input
              type="password"
              className="admin-login__input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              disabled={loading}
            />
          </label>
          <button
            type="submit"
            className="admin-login__submit"
            disabled={loading}
          >
            {loading ? "Registrando…" : "Registrarme"}
          </button>
        </form>
        <p className="admin-login__footer">
          <Link href="/admin" className="admin-login__back">
            Ya tengo cuenta — Iniciar sesión
          </Link>
        </p>
        <Link href="/" className="admin-login__back">
          ← Volver al sitio
        </Link>
      </div>
    </div>
  );
}
