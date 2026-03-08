"use client";

import { useEffect, useState } from "react";
import { auth, getFunctionUrl } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Toaster, toast } from "sonner";

type SessionInfo = {
  uid: string;
  email: string | null;
  isAdmin: boolean;
} | null;

export default function AdminDashboardPage() {
  const [session, setSession] = useState<SessionInfo>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  function loadSession() {
    const u = auth.currentUser;
    if (!u) {
      setLoading(false);
      return;
    }
    u.getIdToken()
      .then((token) =>
        fetch(getFunctionUrl("session"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
      )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setSession({ uid: u.uid, email: u.email ?? null, isAdmin: false });
        else setSession({ uid: data.uid, email: data.email ?? null, isAdmin: data.isAdmin });
      })
      .catch(() => setSession({ uid: u.uid, email: u.email ?? null, isAdmin: false }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function handleCompletarRegistro() {
    const u = auth.currentUser;
    if (!u) return;
    setCompleting(true);
    try {
      const token = await u.getIdToken();
      const res = await fetch(getFunctionUrl("registerAdmin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Registro como admin completado");
        setSession((s) => (s ? { ...s, isAdmin: true } : s));
      } else {
        toast.error(data.error === "invalid_invite_code" ? "Código requerido" : "No se pudo completar. ¿Están desplegadas las functions?");
      }
    } catch {
      toast.error("No se pudo conectar con el servidor. Despliega las functions: firebase deploy --only functions");
    } finally {
      setCompleting(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/admin/";
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="admin-loading__spinner" />
        <p>Cargando panel…</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Toaster position="top-center" />
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__brand">
          <h1>Panel Admin</h1>
          <span className="admin-dashboard__email">{session?.email ?? "—"}</span>
        </div>
        <div className="admin-dashboard__actions">
          {session?.isAdmin === false && (
            <>
              <span className="admin-dashboard__badge">Sin rol admin</span>
              <button
                type="button"
                className="admin-dashboard__complete"
                onClick={handleCompletarRegistro}
                disabled={completing}
              >
                {completing ? "Completando…" : "Completar registro como admin"}
              </button>
            </>
          )}
          <Link href="/" className="admin-dashboard__link">
            Ver sitio
          </Link>
          <button type="button" className="admin-dashboard__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="admin-dashboard__main">
        <section className="admin-dashboard__section">
          <h2>Resumen</h2>
          <p>Gestiona el contenido que se muestra en el sitio: eventos, información y oración.</p>
        </section>
        <section className="admin-dashboard__section admin-dashboard__panels">
          <h2>Paneles de contenido</h2>
          <div className="admin-panel-cards">
            <Link href="/admin/eventos" className="admin-panel-card">
              <span className="admin-panel-card__title">Eventos</span>
              <span className="admin-panel-card__desc">Crear y eliminar cards de eventos. Se muestran en la sección Agenda del sitio.</span>
            </Link>
            <Link href="/admin/agenda" className="admin-panel-card">
              <span className="admin-panel-card__title">Agenda semanal</span>
              <span className="admin-panel-card__desc">Agregar y editar la agenda por día y la lista Por definir.</span>
            </Link>
            <Link href="/admin/ministerios" className="admin-panel-card">
              <span className="admin-panel-card__title">Ministerios activos</span>
              <span className="admin-panel-card__desc">Editar y agregar ministerios que se muestran en el sitio.</span>
            </Link>
            <Link href="/admin/informacion" className="admin-panel-card">
              <span className="admin-panel-card__title">Información</span>
              <span className="admin-panel-card__desc">Editar el bloque de información general que se muestra en el sitio.</span>
            </Link>
            <Link href="/admin/oracion" className="admin-panel-card">
              <span className="admin-panel-card__title">Oración</span>
              <span className="admin-panel-card__desc">Editar versículo y mensaje del Muro de oración.</span>
            </Link>
            <Link href="/admin/multimedia" className="admin-panel-card">
              <span className="admin-panel-card__title">Multimedia</span>
              <span className="admin-panel-card__desc">Subir imágenes a la galería. Se muestran en el sitio como en esta vista. Puedes borrarlas.</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
