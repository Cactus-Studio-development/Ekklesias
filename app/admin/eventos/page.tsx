"use client";

import { useEffect, useState } from "react";
import { auth, FUNCTIONS_URL } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Toaster, toast } from "sonner";

type Evento = { id: string; title?: string; description?: string; fecha?: string; imageUrl?: string | null };

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fecha, setFecha] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  function loadEventos() {
    setLoading(true);
    fetch(`${FUNCTIONS_URL}/eventos`)
      .then((res) => res.json())
      .then((data: { eventos?: Evento[] }) => setEventos(data.eventos ?? []))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEventos();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = auth.currentUser;
    if (!u) return;
    setSaving(true);
    try {
      const token = await u.getIdToken();
      const res = await fetch(`${FUNCTIONS_URL}/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, title, description, fecha, imageUrl: imageUrl || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Evento creado");
        setTitle("");
        setDescription("");
        setFecha("");
        setImageUrl("");
        loadEventos();
      } else {
        toast.error(data.error === "unauthorized" ? "Sin permiso" : "Error al crear");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const u = auth.currentUser;
    if (!u) return;
    setDeletingId(id);
    try {
      const token = await u.getIdToken();
      const res = await fetch(`${FUNCTIONS_URL}/eventos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Evento eliminado");
        setEventos((list) => list.filter((ev) => ev.id !== id));
      } else {
        toast.error(data.error === "unauthorized" ? "Sin permiso" : "Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeletingId(null);
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
          <h1>Panel Admin — Eventos</h1>
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
          <h2>Nueva card de evento</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <label className="admin-form__label">
              Título *
              <input
                type="text"
                className="admin-form__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ej. Reunión de jóvenes"
              />
            </label>
            <label className="admin-form__label">
              Descripción
              <textarea
                className="admin-form__input admin-form__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del evento"
                rows={3}
              />
            </label>
            <label className="admin-form__label">
              Fecha / horario
              <input
                type="text"
                className="admin-form__input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="Ej. Domingo 20:00 h"
              />
            </label>
            <label className="admin-form__label">
              URL de imagen (opcional)
              <input
                type="url"
                className="admin-form__input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
            <button type="submit" className="admin-form__submit" disabled={saving}>
              {saving ? "Publicando…" : "Publicar"}
            </button>
          </form>
        </section>
        <section className="admin-dashboard__section">
          <h2>Eventos publicados</h2>
          {loading ? (
            <p className="admin-panel-muted">Cargando…</p>
          ) : eventos.length === 0 ? (
            <p className="admin-panel-muted">Aún no hay eventos. Crea uno arriba.</p>
          ) : (
            <ul className="admin-eventos-list">
              {eventos.map((ev) => (
                <li key={ev.id} className="admin-eventos-card">
                  <div className="admin-eventos-card__body">
                    {ev.imageUrl && (
                      <img src={ev.imageUrl} alt="" className="admin-eventos-card__img" />
                    )}
                    <div>
                      <strong className="admin-eventos-card__title">{ev.title}</strong>
                      {ev.fecha && <span className="admin-eventos-card__fecha">{ev.fecha}</span>}
                      {ev.description && <p className="admin-eventos-card__desc">{ev.description}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-eventos-card__delete"
                    onClick={() => handleDelete(ev.id)}
                    disabled={deletingId === ev.id}
                  >
                    {deletingId === ev.id ? "…" : "Eliminar"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
