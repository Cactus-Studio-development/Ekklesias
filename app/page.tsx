"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { getFunctionUrl } from "@/lib/firebase";

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
  FiPlay,
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

const DEFAULT_MINISTRIES = [
  { id: "d1", title: "Discipulado", text: "Rutas semanales para crecer en la Palabra con grupos pequeños y acompañamiento pastoral.", icon: "book" as const },
  { id: "d2", title: "Jóvenes y Familia", text: "Espacios activos para fortalecer matrimonios, padres e hijos bajo principios bíblicos.", icon: "users" as const },
  { id: "d3", title: "Misión y Servicio", text: "Salidas comunitarias para evangelismo, ayuda social y oración por la ciudad.", icon: "heart" as const },
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

const ICON_MAP = { heart: FiHeart, users: FiUsers } as const;
const MINISTRY_ICON_MAP = { book: FiBookOpen, users: FiUsers, heart: FiHeart } as const;

function buildWeekCalendarFromSlots(slots: Array<{ day: string; event: string; hour: string; icon?: string }>) {
  return WEEK_DAYS.map(({ key, short }) => ({
    dayName: key,
    shortName: short,
    events: slots
      .filter((s) => s.day === key)
      .map((s) => ({
        day: s.day,
        event: s.event,
        hour: s.hour,
        icon: ICON_MAP[(s.icon as keyof typeof ICON_MAP) ?? "users"] ?? FiUsers,
      })),
  }));
}

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

const DEFAULT_VERSE = {
  text: "No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios y denle gracias.",
  ref: "Filipenses 4:6",
};
const DEFAULT_ORACION_MSG =
  "Cree, ora y permanece firme: Dios sigue obrando hoy. Únete a nuestra comunidad en redes para compartir palabra, esperanza y testimonios de fe.";

type MediaItem =
  | { type: "image"; src: string; title: string }
  | { type: "video"; src: string; title: string }
  | { type: "youtube"; src: string; title: string };

const MEDIA_PLACEMENTS = ["large", "tall", "small", "small", "wide", "wide"] as const;
const YOUTUBE_ITEM: MediaItem = {
  type: "youtube",
  src: "https://www.youtube.com/watch?v=iQpVoxPDpHw",
  title: "Video",
};

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getYoutubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState<Record<string, boolean>>({});
  const [audiovisualOpen, setAudiovisualOpen] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const welcomeDone = useRef(false);

  type EventoCard = { id: string; title?: string; description?: string; fecha?: string; imageUrl?: string | null };
  const [eventos, setEventos] = useState<EventoCard[]>([]);
  const [informacion, setInformacion] = useState<{ title?: string; body?: string }>({});
  const [oracionData, setOracionData] = useState<{ verseText?: string; verseRef?: string; message?: string }>({});
  const GALLERY_PLACEMENTS = ["large", "tall", "small", "small", "wide", "wide"] as const;
  const [multimediaGallery, setMultimediaGallery] = useState<Array<{ src: string; title: string; placement: string }>>([]);
  type AgendaSlot = { day: string; event: string; hour: string; icon?: string };
  const [agendaData, setAgendaData] = useState<{ slots: AgendaSlot[]; porDefinir: string[] } | null>(null);
  type MinisterioItem = { id: string; title?: string; text?: string; icon?: string };
  const [ministeriosData, setMinisteriosData] = useState<MinisterioItem[]>([]);

  const closeAudiovisual = useCallback(() => setAudiovisualOpen(false), []);
  const closeMediaPreview = useCallback(() => setMediaPreview(null), []);

  useEffect(() => {
    if (!audiovisualOpen) setSidebarReady(false);
    else {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setSidebarReady(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [audiovisualOpen]);

  useEffect(() => {
    if (!audiovisualOpen) return;
    setMediaLoading(true);
    Promise.all([
      fetch("/api/audiovisual").then((res) => res.json()).then((data: { items?: MediaItem[] }) => data.items ?? []),
      fetch(getFunctionUrl("multimedia")).then((res) => res.json()).then((data: { items?: Array<{ url?: string; title?: string }> }) => {
        const list = data.items ?? [];
        return list.map((item): MediaItem => ({ type: "image", src: item.url ?? "", title: item.title ?? "Imagen" }));
      }).catch(() => []),
    ])
      .then(([localItems, multimediaItems]) => {
        const combined = [...multimediaItems, ...localItems, YOUTUBE_ITEM];
        setMediaItems(combined);
      })
      .finally(() => setMediaLoading(false));
  }, [audiovisualOpen]);

  useEffect(() => {
    fetch(getFunctionUrl("eventos"))
      .then((res) => res.json())
      .then((data: { eventos?: EventoCard[] }) => setEventos(data.eventos ?? []))
      .catch(() => setEventos([]));
  }, []);
  useEffect(() => {
    fetch(getFunctionUrl("informacion"))
      .then((res) => res.json())
      .then((data: { title?: string; body?: string }) => setInformacion(data))
      .catch(() => setInformacion({}));
  }, []);
  useEffect(() => {
    fetch(getFunctionUrl("oracion"))
      .then((res) => res.json())
      .then((data: { verseText?: string; verseRef?: string; message?: string }) => setOracionData(data))
      .catch(() => setOracionData({}));
  }, []);
  useEffect(() => {
    fetch(getFunctionUrl("multimedia"))
      .then((res) => res.json())
      .then((data: { items?: Array<{ url?: string; title?: string }> }) => {
        const list = data.items ?? [];
        setMultimediaGallery(
          list.map((item, i) => ({
            src: item.url ?? "",
            title: item.title ?? "Imagen",
            placement: GALLERY_PLACEMENTS[i % GALLERY_PLACEMENTS.length],
          }))
        );
      })
      .catch(() => setMultimediaGallery([]));
  }, []);
  useEffect(() => {
    fetch(getFunctionUrl("agenda"))
      .then((res) => res.json())
      .then((data: { slots?: AgendaSlot[]; porDefinir?: string[] }) => {
        if (Array.isArray(data.slots) && data.slots.length > 0) {
          setAgendaData({ slots: data.slots, porDefinir: Array.isArray(data.porDefinir) ? data.porDefinir : [] });
        } else {
          setAgendaData(null);
        }
      })
      .catch(() => setAgendaData(null));
  }, []);
  useEffect(() => {
    fetch(getFunctionUrl("ministerios"))
      .then((res) => res.json())
      .then((data: { items?: MinisterioItem[] }) => setMinisteriosData(Array.isArray(data.items) ? data.items : []))
      .catch(() => setMinisteriosData([]));
  }, []);

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

  useEffect(() => {
    if (!audiovisualOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAudiovisual();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [audiovisualOpen, closeAudiovisual]);

  useEffect(() => {
    if (!mediaPreview) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMediaPreview();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mediaPreview, closeMediaPreview]);

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
          <a href="#informacion" onClick={() => notify("Información")}>
            Información
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
          {(ministeriosData.length > 0 ? ministeriosData : DEFAULT_MINISTRIES).map((item) => {
            const Icon = MINISTRY_ICON_MAP[(item.icon as keyof typeof MINISTRY_ICON_MAP) ?? "users"] ?? FiUsers;
            return (
              <article key={item.id} className="card">
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
        {eventos.length > 0 && (
          <div className="eventos-cards-wrap">
            <h3 className="eventos-cards-title">Próximos eventos</h3>
            <div className="eventos-cards-grid">
              {eventos.map((ev) => (
                <article key={ev.id} className="eventos-card">
                  {ev.imageUrl && (
                    <div className="eventos-card__img-wrap">
                      <img src={ev.imageUrl} alt="" className="eventos-card__img" />
                    </div>
                  )}
                  <div className="eventos-card__body">
                    <h4 className="eventos-card__title">{ev.title}</h4>
                    {ev.fecha && <span className="eventos-card__fecha">{ev.fecha}</span>}
                    {ev.description && <p className="eventos-card__desc">{ev.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        <div className="calendar-wrap">
          <div className="calendar-grid">
            {(agendaData?.slots?.length ? buildWeekCalendarFromSlots(agendaData.slots) : buildWeekCalendar()).map((day) => (
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
            {(agendaData?.porDefinir?.length ? agendaData.porDefinir : schedulePorDefinir).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {(informacion.title || informacion.body) && (
        <section className="panel tone-2 section-soft" id="informacion">
          <div className="section-head">
            <h2>{informacion.title || "Información"}</h2>
            {informacion.body && <div className="section-info-body" dangerouslySetInnerHTML={{ __html: informacion.body.replace(/\n/g, "<br />") }} />}
          </div>
        </section>
      )}

      <section className="panel tone-4 section-soft" id="galeria">
        <div className="section-head">
          <h2>Galería</h2>
          <p>Momentos de nuestra comunidad.</p>
        </div>
        <div className="image-grid">
          {(multimediaGallery.length > 0 ? multimediaGallery : galleryImages).map((img) => (
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
            <span className="prayer-verse-text">&ldquo;{oracionData.verseText || DEFAULT_VERSE.text}&rdquo;</span>
            <cite className="prayer-verse-ref">{oracionData.verseRef || DEFAULT_VERSE.ref}</cite>
          </blockquote>
          <p className="faith-message">
            {oracionData.message || DEFAULT_ORACION_MSG}
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

      <button
        type="button"
        className="fab-audiovisual"
        onClick={() => setAudiovisualOpen(true)}
        aria-label="Abrir contenido audiovisual"
      >
        <FiImage aria-hidden="true" />
      </button>

      {audiovisualOpen && (
        <>
          <div
            className="media-sidebar-backdrop"
            onClick={closeAudiovisual}
            aria-hidden="true"
          />
          <aside
            className={`media-sidebar ${sidebarReady ? "media-sidebar--open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Contenido audiovisual"
          >
            <div className="media-sidebar-header">
              <h2>Contenido audiovisual</h2>
              <button
                type="button"
                className="media-sidebar-close"
                onClick={closeAudiovisual}
                aria-label="Cerrar"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
            <div className="media-sidebar-content">
              {mediaLoading ? (
                <div className="media-sidebar-loading">Cargando…</div>
              ) : mediaItems.length === 0 ? (
                <div className="media-sidebar-empty">Publica imágenes desde el panel Admin → Multimedia, o añade fotos en <code>public/audiovisual/fotos</code> y videos en <code>public/audiovisual/videos</code>.</div>
              ) : (
                mediaItems.map((item, i) => {
                  const placement = MEDIA_PLACEMENTS[i % MEDIA_PLACEMENTS.length];
                  const isYoutube = item.type === "youtube";
                  const ytId = isYoutube ? getYoutubeId(item.src) : null;
                  return (
                    <button
                      key={`${item.type}-${item.src}-${i}`}
                      type="button"
                      className={`media-sidebar-item media-sidebar-item--${placement}`}
                      onClick={() => setMediaPreview(item)}
                    >
                      <span className="media-sidebar-item-inner">
                        {item.type === "image" && (
                          <img src={item.src} alt={item.title} className="media-sidebar-img" />
                        )}
                        {item.type === "video" && (
                          <video
                            src={item.src}
                            className="media-sidebar-video"
                            title={item.title}
                            muted
                            playsInline
                            preload="metadata"
                          >
                            Tu navegador no soporta video.
                          </video>
                        )}
                        {item.type === "youtube" && ytId && (
                          <img
                            src={getYoutubeThumbnail(ytId)}
                            alt={item.title}
                            className="media-sidebar-img"
                          />
                        )}
                        {(item.type === "video" || item.type === "youtube") && (
                          <span className="media-sidebar-play" aria-hidden="true">
                            <FiPlay />
                          </span>
                        )}
                        <span className="media-sidebar-caption">
                          <FiImage aria-hidden="true" className="media-sidebar-caption-icon" />
                          {item.title}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

      {mediaPreview && (
        <div
          className="media-modal-backdrop"
          onClick={closeMediaPreview}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
        >
          <div className="media-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-header">
              <span className="media-modal-title">{mediaPreview.title}</span>
              <button
                type="button"
                className="media-modal-close"
                onClick={closeMediaPreview}
                aria-label="Cerrar"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
            <div className="media-modal-body">
              {mediaPreview.type === "image" && (
                <img src={mediaPreview.src} alt={mediaPreview.title} className="media-modal-media" />
              )}
              {mediaPreview.type === "video" && (
                <video
                  src={mediaPreview.src}
                  controls
                  autoPlay
                  className="media-modal-media"
                  title={mediaPreview.title}
                >
                  Tu navegador no soporta video.
                </video>
              )}
              {mediaPreview.type === "youtube" && (() => {
                const id = getYoutubeId(mediaPreview.src);
                return id ? (
                  <iframe
                    className="media-modal-iframe"
                    src={`https://www.youtube.com/embed/${id}?autoplay=1`}
                    title={mediaPreview.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </main>
    </>
  );
}
