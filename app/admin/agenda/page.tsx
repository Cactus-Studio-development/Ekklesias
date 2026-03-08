"use client";

import { useEffect, useState } from "react";
import { auth, FUNCTIONS_URL } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { FiCalendar, FiHeart, FiUsers } from "react-icons/fi";

const WEEK_DAYS = [
  { key: "Lunes", short: "Lun" },
  { key: "Martes", short: "Mar" },
  { key: "Miércoles", short: "Mié" },
  { key: "Jueves", short: "Jue" },
  { key: "Viernes", short: "Vie" },
  { key: "Sábado", short: "Sáb" },
  { key: "Domingo", short: "Dom" },
];

type Slot = { day: string; event: string; hour: string; icon: string };

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  heart: FiHeart,
  users: FiUsers,
};

export default function AdminAgendaPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [porDefinir, setPorDefinir] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetch(`${FUNCTIONS_URL}/agenda`)
      .then((res) => res.json())
      .then((data: { slots?: Slot[]; porDefinir?: string[] }) => {
        setSlots(Array.isArray(data.slots) ? data.slots : []);
        setPorDefinir(Array.isArray(data.porDefinir) ? data.porDefinir : []);
      })
      .catch(() => {
        setSlots([]);
        setPorDefinir([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function getSlotsForDay(day: string) {
    return slots.filter((s) => s.day === day);
  }

  function buildPreviewCalendar() {
    return WEEK_DAYS.map(({ key, short }) => ({
      dayName: key,
      shortName: short,
      events: getSlotsForDay(key).filter((s) => s.event.trim()),
    }));
  }

  function addSlot(day: string) {
    setSlots((prev) => [...prev, { day, event: "", hour: "", icon: "users" }]);
  }

  function updateSlot(index: number, field: keyof Slot, value: string) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function addPorDefinir() {
    setPorDefinir((prev) => [...prev, ""]);
  }

  function updatePorDefinir(index: number, value: string) {
    setPorDefinir((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function removePorDefinir(index: number) {
    setPorDefinir((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = auth.currentUser;
    if (!u) return;
    const validSlots = slots.filter((s) => s.day && s.event.trim());
    setSaving(true);
    try {
      const token = await u.getIdToken();
      const res = await fetch(`${FUNCTIONS_URL}/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          slots: validSlots,
          porDefinir: porDefinir.filter((x) => x.trim()),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Agenda guardada");
        setSlots(validSlots);
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
          <h1>Panel Admin — Agenda semanal</h1>
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
          <h2>Agregar y editar agenda</h2>
          <p className="admin-panel-muted">Define los eventos por día y la lista &quot;Por definir&quot;. Se reflejan en la sección Agenda semanal del sitio.</p>
          {loading ? (
            <p className="admin-panel-muted">Cargando…</p>
          ) : (
            <form onSubmit={handleSubmit} className="admin-form admin-agenda-form">
              {WEEK_DAYS.map(({ key: day }) => (
                <div key={day} className="admin-agenda-day">
                  <h3 className="admin-agenda-day-title">{day}</h3>
                  {getSlotsForDay(day).map((slot, idx) => {
                    const globalIndex = slots.findIndex((s) => s === slot);
                    return (
                      <div key={globalIndex} className="admin-agenda-slot">
                        <input
                          type="text"
                          className="admin-form__input admin-agenda-input"
                          placeholder="Evento (ej. Oración)"
                          value={slot.event}
                          onChange={(e) => updateSlot(globalIndex, "event", e.target.value)}
                        />
                        <input
                          type="text"
                          className="admin-form__input admin-agenda-input admin-agenda-hour"
                          placeholder="Hora (ej. 06:00 h)"
                          value={slot.hour}
                          onChange={(e) => updateSlot(globalIndex, "hour", e.target.value)}
                        />
                        <select
                          className="admin-form__input admin-agenda-icon"
                          value={slot.icon}
                          onChange={(e) => updateSlot(globalIndex, "icon", e.target.value)}
                        >
                          <option value="users">Reunión / Grupo (icono usuarios)</option>
                          <option value="heart">Oración (icono corazón)</option>
                        </select>
                        <button type="button" className="admin-agenda-remove" onClick={() => removeSlot(globalIndex)}>
                          Quitar
                        </button>
                      </div>
                    );
                  })}
                  <button type="button" className="admin-agenda-add" onClick={() => addSlot(day)}>
                    + Añadir evento en {day}
                  </button>
                </div>
              ))}
              <div className="admin-agenda-day">
                <h3 className="admin-agenda-day-title">Por definir</h3>
                {porDefinir.map((item, index) => (
                  <div key={index} className="admin-agenda-slot">
                    <input
                      type="text"
                      className="admin-form__input admin-agenda-input"
                      placeholder="Ej. Reunión de mujeres y varones"
                      value={item}
                      onChange={(e) => updatePorDefinir(index, e.target.value)}
                    />
                    <button type="button" className="admin-agenda-remove" onClick={() => removePorDefinir(index)}>
                      Quitar
                    </button>
                  </div>
                ))}
                <button type="button" className="admin-agenda-add" onClick={addPorDefinir}>
                  + Añadir ítem por definir
                </button>
              </div>
              <button type="submit" className="admin-form__submit" disabled={saving}>
                {saving ? "Publicando…" : "Publicar"}
              </button>
            </form>
          )}
        </section>

        {!loading && (
          <section className="admin-dashboard__section admin-agenda-preview">
            <h2>Vista previa de la agenda</h2>
            <p className="admin-panel-muted">Así se verá la agenda en el sitio al publicar.</p>
            <div className="admin-agenda-preview-inner">
              <div className="agenda-section agenda-section--preview">
                <div className="section-head agenda-head">
                  <h2><FiCalendar aria-hidden="true" /> Agenda semanal</h2>
                  <p>Conecta con la comunidad en reuniones presenciales y online.</p>
                </div>
                <div className="calendar-wrap">
                  <div className="calendar-grid">
                    {buildPreviewCalendar().map((day) => (
                      <div key={day.dayName} className="calendar-day">
                        <div className="calendar-day-header">{day.shortName}</div>
                        <div className="calendar-day-cell">
                          {day.events.length > 0 ? (
                            day.events.map((slot) => {
                              const Icon = ICON_COMPONENTS[slot.icon] ?? FiUsers;
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
                    {porDefinir.filter((x) => x.trim()).length > 0 ? (
                      porDefinir.filter((x) => x.trim()).map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li className="admin-panel-muted">— Sin ítems —</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
