"use client";

import { useEffect, useState } from "react";
import { auth, FUNCTIONS_URL } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Toaster, toast } from "sonner";

type Ministerio = { id: string; title?: string; text?: string; icon?: string };

const ICON_OPTIONS = [
  { value: "book", label: "Discipulado / Libro" },
  { value: "users", label: "Reunión / Grupo" },
  { value: "heart", label: "Misión / Oración" },
] as const;

export default function AdminMinisteriosPage() {
  const [items, setItems] = useState<Ministerio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [icon, setIcon] = useState<string>("users");

  function load() {
    setLoading(true);
    fetch(`${FUNCTIONS_URL}/ministerios`)
      .then((res) => res.json())
      .then((data: { items?: Ministerio[] }) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item: Ministerio) {
    setEditingId(item.id);
    setTitle(item.title ?? "");
    setText(item.text ?? "");
    setIcon(item.icon ?? "users");
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setText("");
    setIcon("users");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = auth.currentUser;
    if (!u) return;
    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const token = await u.getIdToken();
      const res = await fetch(`${FUNCTIONS_URL}/ministerios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ...(editingId ? { id: editingId } : {}),
          title: title.trim(),
          text: text.trim(),
          icon,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success(editingId ? "Ministerio actualizado" : "Ministerio creado");
        cancelEdit();
        load();
      } else {
        toast.error(data.error === "unauthorized" ? "Sin permiso" : "Error al guardar");
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
      const res = await fetch(`${FUNCTIONS_URL}/ministerios?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Ministerio eliminado");
        setItems((prev) => prev.filter((x) => x.id !== id));
        if (editingId === id) cancelEdit();
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
          <h1>Panel Admin — Ministerios activos</h1>
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
          <h2>{editingId ? "Editar ministerio" : "Nuevo ministerio"}</h2>
          <p className="admin-panel-muted">Los ministerios se muestran en la sección Ministerios activos del sitio.</p>
          <form onSubmit={handleSubmit} className="admin-form">
            <label className="admin-form__label">
              Título *
              <input
                type="text"
                className="admin-form__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ej. Discipulado"
              />
            </label>
            <label className="admin-form__label">
              Descripción
              <textarea
                className="admin-form__input admin-form__textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Breve descripción del ministerio"
                rows={3}
              />
            </label>
            <label className="admin-form__label">
              Icono
              <select
                className="admin-form__input"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                style={{ maxWidth: "20rem" }}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <div className="admin-form__actions">
              <button type="submit" className="admin-form__submit" disabled={saving}>
                {saving ? "Publicando…" : "Publicar"}
              </button>
              {editingId && (
                <button type="button" className="admin-form__cancel" onClick={cancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
        <section className="admin-dashboard__section">
          <h2>Ministerios publicados</h2>
          {loading ? (
            <p className="admin-panel-muted">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="admin-panel-muted">Aún no hay ministerios. Crea uno arriba.</p>
          ) : (
            <ul className="admin-eventos-list">
              {items.map((item) => (
                <li key={item.id} className="admin-eventos-card">
                  <div className="admin-eventos-card__body">
                    <div>
                      <strong className="admin-eventos-card__title">{item.title}</strong>
                      <p className="admin-eventos-card__desc">{item.text || "—"}</p>
                      <span className="admin-panel-muted">Icono: {item.icon ?? "users"}</span>
                    </div>
                  </div>
                  <div className="admin-eventos-card__actions">
                    <button
                      type="button"
                      className="admin-eventos-card__edit"
                      onClick={() => startEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="admin-eventos-card__delete"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "…" : "Eliminar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
