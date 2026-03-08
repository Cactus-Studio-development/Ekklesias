"use client";

import { useEffect, useRef, useState } from "react";
import { auth, storage, getFunctionUrl } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { FiImage } from "react-icons/fi";

type MultimediaItem = { id: string; url?: string; title?: string; storagePath?: string | null };

const PLACEMENTS = ["large", "tall", "small", "small", "wide", "wide"] as const;

function getPlacement(i: number) {
  return PLACEMENTS[i % PLACEMENTS.length];
}

export default function AdminMultimediaPage() {
  const [items, setItems] = useState<MultimediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadItems() {
    setLoading(true);
    fetch(getFunctionUrl("multimedia"))
      .then((res) => res.json())
      .then((data: { items?: MultimediaItem[] }) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = auth.currentUser;
    if (!u || !storage) return;
    const toUpload = files.length > 0 ? files : [];
    if (toUpload.length === 0) {
      toast.error("Elige una o más imágenes");
      return;
    }
    setUploading(true);
    setUploadProgress({ current: 0, total: toUpload.length });
    const token = await u.getIdToken();
    let ok = 0;
    try {
      for (let i = 0; i < toUpload.length; i++) {
        setUploadProgress({ current: i + 1, total: toUpload.length });
        const file = toUpload[i];
        const ext = file.name.replace(/^.*\./, "") || "jpg";
        const storagePath = `publication/${u.uid}_${Date.now()}_${i}.${ext}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const res = await fetch(getFunctionUrl("multimedia"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            url,
            title: toUpload.length === 1 && title.trim() ? title.trim() : file.name.replace(/\.[^.]+$/, ""),
            storagePath,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) ok++;
      }
      if (ok > 0) {
        toast.success(ok === toUpload.length ? `${ok} imagen${ok === 1 ? "" : "es"} publicada${ok === 1 ? "" : "s"}` : `Publicadas ${ok} de ${toUpload.length}`);
        setTitle("");
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadItems();
      }
      if (ok < toUpload.length) {
        toast.error(`No se pudieron publicar ${toUpload.length - ok} imagen${toUpload.length - ok === 1 ? "" : "es"}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al subir.";
      toast.error(`Error al subir: ${msg}. Revisa Storage y reglas (firebase deploy --only storage).`);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleDelete(id: string) {
    const u = auth.currentUser;
    if (!u) return;
    setDeletingId(id);
    try {
      const token = await u.getIdToken();
      const res = await fetch(`${getFunctionUrl("multimedia")}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Imagen eliminada");
        setItems((list) => list.filter((x) => x.id !== id));
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
          <h1>Panel Admin — Multimedia</h1>
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
          <h2>Cargar imagen</h2>
          <p className="admin-panel-muted">Las imágenes se suben a la carpeta <strong>publication</strong> en Firebase Storage y aparecen en la galería del sitio. El contenido que publiques se muestra abajo; puedes borrarlo con Eliminar.</p>
          <form onSubmit={handleSubmit} className="admin-form">
            <label className="admin-form__label">
              Imagen o imágenes *
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="admin-form__input"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              {files.length > 0 && (
                <span className="admin-form__hint">{files.length} imagen{files.length === 1 ? "" : "es"} seleccionada{files.length === 1 ? "" : "s"}</span>
              )}
            </label>
            <label className="admin-form__label">
              Título (opcional, solo si subes una imagen)
              <input
                type="text"
                className="admin-form__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Celebración 2025"
              />
            </label>
            <button type="submit" className="admin-form__submit" disabled={uploading}>
              {uploading && uploadProgress
                ? `Publicando ${uploadProgress.current}/${uploadProgress.total}…`
                : uploading
                  ? "Publicando…"
                  : "Publicar"}
            </button>
          </form>
        </section>
        <section className="admin-dashboard__section">
          <h2>Contenido subido</h2>
          <p className="admin-panel-muted">Todo lo que publiques aparece aquí. Usa Eliminar para borrar una imagen.</p>
          {loading ? (
            <p className="admin-panel-muted">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="admin-panel-muted">Aún no hay imágenes. Publica una arriba.</p>
          ) : (
            <div className="admin-multimedia-grid">
              {items.map((item, i) => (
                <div key={item.id} className={`admin-multimedia-card admin-multimedia-card--${getPlacement(i)}`}>
                  <div className="admin-multimedia-card__img-wrap">
                    <img src={item.url} alt={item.title || "Imagen"} className="admin-multimedia-card__img" />
                    <div className="admin-multimedia-card__caption">
                      <FiImage aria-hidden="true" />
                      <span>{item.title || "Imagen"}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-multimedia-card__delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "…" : "Eliminar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
