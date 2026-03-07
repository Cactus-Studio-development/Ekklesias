"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublicAdminPage = pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/registro";
    if (isPublicAdminPage && user) {
      window.location.href = "/admin/dashboard";
      return;
    }
    if (!isPublicAdminPage && !user) {
      window.location.href = "/admin";
      return;
    }
  }, [loading, user, pathname]);

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="admin-loading__spinner" />
        <p>Cargando…</p>
      </div>
    );
  }

  const isPublicAdminPage = pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/registro";
  if (isPublicAdminPage && !user) {
    return (
      <>
        {!auth && (
          <div className="admin-config-warning">
            Configura las variables de Firebase en <code>.env.local</code> (ver <code>.env.example</code>) para poder iniciar sesión o registrarte.
          </div>
        )}
        {children}
      </>
    );
  }
  if (!isPublicAdminPage && user) return <>{children}</>;

  return null;
}
