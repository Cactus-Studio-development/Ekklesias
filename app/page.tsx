"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);
import {
  FiBookOpen,
  FiCalendar,
  FiChevronRight,
  FiExternalLink,
  FiHeart,
  FiImage,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Toaster, toast } from "sonner";
import { Skeleton } from "./components/Skeleton";

const WELCOME_LOTTIE_URL = "https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json";
const WELCOME_DURATION_MS = 4000;

const placeholderSvg = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#DAE7D5" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#415236" font-family="sans-serif" font-size="20">${label}</text></svg>`
  )}`;

const galleryImages = [
  { src: "/image/01.jpeg", title: "Comunidad Ekklesias", placement: "large" },
  { src: "/image/02.jpeg", title: "Celebración", placement: "tall" },
  { src: "/image/03.jpeg", title: "Enseñanza", placement: "small" },
  { src: "/image/04.jpeg", title: "Oración", placement: "small" },
  { src: "/image/05.jpeg", title: "Alabanza", placement: "wide" },
  { src: "/image/06.jpeg", title: "Ministerios", placement: "wide" },
];

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
  { day: "Martes", event: "Oración", hour: "06:00 h", icon: FiHeart },
  { day: "Jueves", event: "Reunión General", hour: "20:00 h", icon: FiUsers },
  { day: "Viernes", event: "Oración", hour: "06:00 h", icon: FiHeart },
  { day: "Sábado", event: "Reunión de Jóvenes", hour: "20:00 h", icon: FiUsers },
  { day: "Domingo", event: "Reunión General", hour: "20:00 h", icon: FiUsers },
];

const WEEK_DAYS = [
  { key: "Lunes", short: "Lun" },
  { key: "Martes", short: "Mar" },
  { key: "Miércoles", short: "Mié" },
  { key: "Jueves", short: "Jue" },
  { key: "Viernes", short: "Vie" },
  { key: "Sábado", short: "Sáb" },
  { key: "Domingo", short: "Dom" },
];

function buildWeekCalendar() {
  return WEEK_DAYS.map(({ key, short }) => ({
    dayName: key,
    shortName: short,
    events: schedule.filter((s) => s.day === key),
  }));
}

const schedulePorDefinir = [
  "Reunión de mujeres y varones",
  "Clases de música",
  "Danza (cuando retomen)",
];

const visualImages = {
  hero: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
  ministerios: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80",
  oracion: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
};

const prayerVerse = {
  text: "No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios y denle gracias.",
  ref: "Filipenses 4:6",
};

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState<Record<string, boolean>>({});
  const welcomeDone = useRef(false);

  const markGalleryLoaded = useCallback((src: string) => {
    setGalleryLoaded((prev) => ({ ...prev, [src]: true }));
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => {
      if (!welcomeDone.current) {
        welcomeDone.current = true;
        setShowWelcome(false);
      }
    }, WELCOME_DURATION_MS);
    return () => clearTimeout(t);
  }, [showWelcome]);

  const handleWelcomeComplete = useCallback(() => {
    if (!welcomeDone.current) {
      welcomeDone.current = true;
      setShowWelcome(false);
    }
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLightbox();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox]);

  const notify = (message: string) => {
    toast.success(message);
  };

  return (
    <>
      {showWelcome && (
        <div className="welcome-overlay" role="dialog" aria-label="Bienvenida">
          <div className="welcome-content">
            <Player
              autoplay
              loop={false}
              keepLastFrame
              src={WELCOME_LOTTIE_URL}
              style={{ height: "160px", width: "160px" }}
              onEvent={(e) => e === "complete" && handleWelcomeComplete()}
            />
            <h1 className="welcome-title">Bienvenidos a EKKLESIA</h1>
            <p className="welcome-sub">Una comunidad para crecer en Cristo</p>
          </div>
        </div>
      )}

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
          <a href="#galeria" onClick={() => notify("Galería")}>
            Galería
          </a>
        </nav>
      </header>

      <section className="hero tone-1 hero-elegant">
        <div className={`hero-bg-img ${heroImageLoaded ? "img-loaded" : ""}`} aria-hidden="true">
          <Skeleton className="hero-bg-skeleton" variant="rect" />
          <img
            src={visualImages.hero}
            alt=""
            onLoad={() => setHeroImageLoaded(true)}
          />
        </div>
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
        <div className="ministerios-banner" style={{ position: "relative" }}>
          <Image src={visualImages.ministerios} alt="" fill style={{ objectFit: "cover" }} />
        </div>
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

      <section className="panel tone-3 panel-white agenda-section" id="eventos">
        <div className="section-head agenda-head">
          <h2>
            <FiCalendar aria-hidden="true" /> Agenda semanal
          </h2>
          <p>Conecta con la comunidad en reuniones presenciales y online.</p>
        </div>
        <div className="calendar-wrap">
          <div className="calendar-grid">
            {buildWeekCalendar().map((day) => (
              <div key={day.dayName} className="calendar-day">
                <div className="calendar-day-header">{day.shortName}</div>
                <div className="calendar-day-cell">
                  {day.events.length > 0 ? (
                    day.events.map((slot) => {
                      const Icon = slot.icon;
                      return (
                        <div key={`${slot.day}-${slot.event}`} className="calendar-event">
                          <Icon className="calendar-event-icon" aria-hidden="true" />
                          <span className="calendar-event-name">{slot.event}</span>
                          <span className="calendar-event-hour">{slot.hour}</span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="calendar-day-empty">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="agenda-tbd">
          <p className="agenda-tbd-title">Por definir</p>
          <ul className="agenda-tbd-list">
            {schedulePorDefinir.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel tone-4 section-soft" id="galeria">
        <div className="section-head">
          <h2>Galería</h2>
          <p>Momentos de nuestra comunidad.</p>
        </div>
        <div className="image-grid">
          {galleryImages.map((img) => (
            <button
              key={img.src}
              type="button"
              className={`image-grid-item image-grid-item--${img.placement}`}
              onClick={() => setLightbox({ src: img.src, title: img.title })}
            >
              {!galleryLoaded[img.src] && (
                <Skeleton className="image-grid-skeleton" variant="rect" />
              )}
              <img
                src={img.src}
                alt={img.title}
                className="image-grid-img"
                onLoad={() => markGalleryLoaded(img.src)}
                onError={(e) => {
                  e.currentTarget.src = placeholderSvg(img.title);
                  markGalleryLoaded(img.src);
                }}
              />
              <div className="image-grid-caption">
                <FiImage className="image-grid-icon" aria-hidden="true" />
                <span>{img.title}</span>
              </div>
            </button>
          ))}
        </div>

        {lightbox && (
          <div
            className="lightbox-backdrop"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Imagen ampliada"
          >
            <div className="lightbox-wrap" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="lightbox-close"
                onClick={closeLightbox}
                aria-label="Cerrar"
              >
                <FiX aria-hidden="true" />
              </button>
              <Image
                src={lightbox.src}
                alt={lightbox.title}
                className="lightbox-img"
                fill
                style={{ objectFit: "contain" }}
              />
              <p className="lightbox-caption">{lightbox.title}</p>
            </div>
          </div>
        )}
      </section>

      <section className="panel prayer tone-5" id="oracion">
        <div className="prayer-bg" aria-hidden="true" style={{ position: "relative" }}>
          <Image src={visualImages.oracion} alt="" fill style={{ objectFit: "cover" }} />
          <span className="prayer-bg-overlay" />
        </div>
        <div className="prayer-content">
          <h2>
            <FiHeart aria-hidden="true" /> Muro de oración
          </h2>
          <p className="prayer-tagline">Unidos en oración, crecemos en fe.</p>
          <blockquote className="prayer-verse">
            <span className="prayer-verse-text">&ldquo;{prayerVerse.text}&rdquo;</span>
            <cite className="prayer-verse-ref">{prayerVerse.ref}</cite>
          </blockquote>
          <p className="faith-message">
            Cree, ora y permanece firme: Dios sigue obrando hoy. Únete a nuestra comunidad en redes para compartir
            palabra, esperanza y testimonios de fe.
          </p>
          <div className="social-links" aria-label="Redes sociales de Ekklesias">
          <a href="https://www.facebook.com/share/1JB3kGon3E/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebookF aria-hidden="true" />
          </a>
          <a href="https://www.instagram.com/ekklesia.unlugarparatodos?igsh=aGU4eTEyc21sN2g3" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram aria-hidden="true" />
          </a>
        </div>
        </div>
      </section>

      <section className="panel tone-2 sponsor-section" id="patrocinador">
        <div className="sponsor-content">
          <p className="sponsor-label">Patrocinado por</p>
          <h2 className="sponsor-name">Osisgen</h2>
          <a
            href="https://dev.osisg.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="sponsor-link"
          >
            Ver qué es <FiExternalLink aria-hidden="true" />
          </a>
          <div className="sponsor-stores">
            <p className="sponsor-stores-label">Disponible próximamente</p>
            <div className="sponsor-badges">
              <span className="sponsor-badge" aria-hidden="true">
                <Image src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Disponible en App Store" width={160} height={53} />
              </span>
              <Image
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Disponible en Google Play"
                className="sponsor-badge-img"
                width={200}
                height={77}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
