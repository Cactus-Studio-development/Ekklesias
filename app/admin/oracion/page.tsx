"use client";

import { useEffect, useState } from "react";
import { auth, FUNCTIONS_URL } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Toaster, toast } from "sonner";

export default function AdminOracionPage() {
  const [verseText, setVerseText] = useState("");
  const [verseRef, setVerseRef] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetch(`${FUNCTIONS_URL}/oracion`)
      .then((res) => res.json())
      .then((data: { verseText?: string; verseRef?: string; message?: string }) => {
        setVerseText(data.verseText ?? "");
        setVerseRef(data.verseRef ?? "");
        setMessage(data.message ?? "");
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
      const res = await fetch(`${FUNCTIONS_URL}/oracion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, verseText, verseRef, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Contenido de oración guardado");
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
          <h1>Panel Admin — Oración</h1>
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
          <h2>Contenido del bloque Oración</h2>
          <p className="admin-panel-muted">Texto del versículo y mensaje que se muestran en la sección Muro de oración.</p>
          {loading ? (
            <p className="admin-panel-muted">Cargando…</p>
          ) : (
            <form onSubmit={handleSubmit} className="admin-form">
              <label className="admin-form__label">
                Texto del versículo
                <textarea
                  className="admin-form__input admin-form__textarea"
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                  placeholder="Ej. No se inquieten por nada; más bien, en toda ocasión, con oración y ruego..."
                  rows={3}
                />
              </label>
              <label className="admin-form__label">
                Referencia (ej. Filipenses 4:6)
                <input
                  type="text"
                  className="admin-form__input"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  placeholder="Filipenses 4:6"
                />
              </label>
              <label className="admin-form__label">
                Mensaje / invitación
                <textarea
                  className="admin-form__input admin-form__textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cree, ora y permanece firme..."
                  rows={5}
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
