import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">
          <span className="not-found-code">404</span>
          <span className="not-found-sep" aria-hidden="true" />
          <span className="not-found-msg">Esta página no existe</span>
        </h1>
        <p className="not-found-desc">
          La ruta que buscas no está disponible. Puedes volver al inicio o al panel de administración.
        </p>
        <nav className="not-found-actions">
          <Link href="/" className="not-found-link not-found-link--primary">
            Ir al inicio
          </Link>
          <Link href="/admin/dashboard" className="not-found-link">
            Panel admin
          </Link>
        </nav>
      </div>
    </div>
  );
}
