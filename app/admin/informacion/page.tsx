"use client";

import { useEffect, useState } from "react";
import { auth, getFunctionUrl } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Toaster, toast } from "sonner";

export default function AdminInformacionPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetch(getFunctionUrl("informacion"))
      .then((res) => res.json())
      .then((data: { title?: string; body?: string }) => {
        setTitle(data.title ?? "");
        setBody(data.body ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = auth.currentUser;
    if (!u) return;
    setSaving(true);
    try {
      const token = await u.getIdToken();
      const res = await fetch(getFunctionUrl("informacion"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Información guardada");
      } else {
        toast.error(data.error === "unauthorized" ? "Sin permiso" : "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/admin";
  }

  return (
    <div className="admin-dashboard">
      <Toaster position="top-center" />
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__brand">
          <h1>Panel Admin — Información</h1>
        </div>
        <div className="admin-dashboard__actions">
          <Link href="/admin/dashboard" className="admin-dashboard__link">Dashboard</Link>
          <Link href="/" className="admin-dashboard__link">Ver sitio</Link>
          <button type="button" className="admin-dashboard__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="admin-dashboard__main">
        <section className="admin-dashboard__section admin-panel-form">
          <h2>Contenido del bloque Información</h2>
          <p className="admin-panel-muted">Este texto se muestra en la sección Información del sitio.</p>
          {loading ? (
            <p className="admin-panel-muted">Cargando…</p>
          ) : (
            <form onSubmit={handleSubmit} className="admin-form">
              <label className="admin-form__label">
                Título
                <input
                  type="text"
                  className="admin-form__input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la sección"
                />
              </label>
              <label className="admin-form__label">
                Contenido
                <textarea
                  className="admin-form__input admin-form__textarea"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Texto o información para la congregación"
                  rows={8}
                />
              </label>
              <button type="submit" className="admin-form__submit" disabled={saving}>
                {saving ? "Publicando…" : "Publicar"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
