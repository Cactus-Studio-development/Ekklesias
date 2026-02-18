"use client";

import {
  FiBookOpen,
  FiCalendar,
  FiChevronRight,
  FiHeart,
  FiMic,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { Toaster, toast } from "sonner";

const ministries = [
  {
    title: "Discipulado",
    text: "Rutas semanales para crecer en la Palabra con grupos pequeños y acompañamiento pastoral.",
    icon: FiBookOpen,
  },
  {
    title: "Jóvenes y Familia",
    text: "Espacios activos para fortalecer matrimonios, padres e hijos bajo principios bíblicos.",
    icon: FiUsers,
  },
  {
    title: "Misión y Servicio",
    text: "Salidas comunitarias para evangelismo, ayuda social y oración por la ciudad.",
    icon: FiHeart,
  },
];

const schedule = [
  { day: "Domingo", event: "Celebración Principal", hour: "10:00 AM" },
  { day: "Miércoles", event: "Noche de Oración", hour: "7:00 PM" },
  { day: "Viernes", event: "Conexión de Jóvenes", hour: "6:30 PM" },
];

const sermons = [
  "Viviendo por Fe en Tiempos Difíciles",
  "El Poder de la Gracia en la Vida Diaria",
  "Una Iglesia que Ama y Sirve",
];

export default function HomePage() {
  const notify = (message: string) => {
    toast.success(`Siloe: ${message}`);
  };

  const notifySocial = (network: string) => {
    toast(`Siloe: te conectamos con ${network}.`, {
      description: "Pronto publicaremos los enlaces oficiales de Ekklesias.",
    });
  };

  return (
    <main className="site">
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "8px",
          },
        }}
      />

      <header className="topbar">
        <div className="brand-block">
          <span className="brand-badge">EK</span>
          <strong className="brand">Ekklesias</strong>
        </div>
        <nav className="nav-links">
          <a href="#ministerios" onClick={() => notify("Mostrando ministerios activos")}
          >
            <FiUsers aria-hidden="true" /> Ministerios
          </a>
          <a href="#eventos" onClick={() => notify("Abriendo agenda de eventos")}
          >
            <FiCalendar aria-hidden="true" /> Eventos
          </a>
          <a href="#oracion" onClick={() => notify("Entrando al muro de oración")}
          >
            <FiUserCheck aria-hidden="true" /> Oración
          </a>
        </nav>
      </header>

      <section className="hero tone-1 hero-elegant">
        <div className="hero-main">
          <p className="hero-tag">Comunidad Evangélica</p>
          <h1>Ekklesias: una plataforma para crecer en Cristo</h1>
          <p className="hero-text">
            Únete a una iglesia viva: recibe enseñanzas bíblicas, conecta con tu ministerio y participa en eventos
            diseñados para fortalecer tu fe.
          </p>
          <div className="hero-actions">
            <a href="#eventos" className="btn btn-solid" onClick={() => notify("Agenda abierta")}
            >
              Ver eventos <FiChevronRight aria-hidden="true" />
            </a>
            <a href="#oracion" className="btn btn-outline" onClick={() => notify("Gracias por orar con nosotros")}
            >
              Enviar petición
            </a>
          </div>
        </div>

        <aside className="hero-aside">
          <h3>Hoy en Ekklesias</h3>
          <ul className="quick-list">
            <li>
              <FiCalendar aria-hidden="true" /> Reunión principal
            </li>
            <li>
              <FiBookOpen aria-hidden="true" /> Lectura bíblica guiada
            </li>
            <li>
              <FiHeart aria-hidden="true" /> Cadena de oración
            </li>
          </ul>
        </aside>
      </section>

      <section className="panel tone-2 section-soft" id="ministerios">
        <div className="section-head">
          <h2>Ministerios activos</h2>
          <p>Encuentra el área donde Dios te llama a servir y crecer.</p>
        </div>
        <div className="card-grid">
          {ministries.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="card">
                <Icon className="card-icon" aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="split" id="eventos">
        <article className="panel tone-3 panel-white">
          <div className="section-head">
            <h2>
              <FiCalendar aria-hidden="true" /> Agenda semanal
            </h2>
            <p>Conecta con la comunidad en reuniones presenciales y online.</p>
          </div>
          <ul className="agenda-list">
            {schedule.map((slot) => (
              <li key={`${slot.day}-${slot.event}`}>
                <span>{slot.day}</span>
                <strong>{slot.event}</strong>
                <em>{slot.hour}</em>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel tone-4">
          <div className="section-head">
            <h2>
              <FiMic aria-hidden="true" /> Mensajes recientes
            </h2>
            <p>Contenido bíblico práctico para tu vida diaria.</p>
          </div>
          <ul className="sermon-list">
            {sermons.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel prayer tone-5 panel-white" id="oracion">
        <h2>
          <FiHeart aria-hidden="true" /> Muro de oración
        </h2>
        <p className="faith-message">
          Cree, ora y permanece firme: Dios sigue obrando hoy. Únete a nuestra comunidad en redes para compartir
          palabra, esperanza y testimonios de fe.
        </p>
        <div className="social-links" aria-label="Redes sociales de Ekklesias">
          <a href="#" aria-label="Facebook" onClick={(e) => {
            e.preventDefault();
            notifySocial("Facebook");
          }}>
            <FaFacebookF aria-hidden="true" />
          </a>
          <a href="#" aria-label="Instagram" onClick={(e) => {
            e.preventDefault();
            notifySocial("Instagram");
          }}>
            <FaInstagram aria-hidden="true" />
          </a>
          <a href="#" aria-label="YouTube" onClick={(e) => {
            e.preventDefault();
            notifySocial("YouTube");
          }}>
            <FaYoutube aria-hidden="true" />
          </a>
          <a href="#" aria-label="WhatsApp" onClick={(e) => {
            e.preventDefault();
            notifySocial("WhatsApp");
          }}>
            <FaWhatsapp aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
