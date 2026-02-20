# Ekklesias

Sitio web de la comunidad evangélica **Ekklesias**: una plataforma para crecer en Cristo, con información de ministerios, agenda semanal, galería y muro de oración.

---

## Contenido del README

- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Secciones de la página](#secciones-de-la-página)
- [Personalización](#personalización)
- [Build y despliegue](#build-y-despliegue)

---

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| **Next.js 14** | Framework React con App Router |
| **React 18** | Interfaz de usuario |
| **TypeScript** | Tipado estático |
| **react-icons** | Iconos (Feather, Font Awesome) |
| **Sonner** | Notificaciones toast |
| **@lottiefiles/react-lottie-player** | Animación Lottie de bienvenida |

El proyecto está configurado con **export estático** (`output: 'export'` en `next.config.mjs`), por lo que genera HTML/CSS/JS estáticos sin servidor Node en producción.

---

## Requisitos

- **Node.js** 18.x o superior
- **npm** (o yarn / pnpm)

---

## Instalación

1. Clonar o descargar el repositorio y entrar en la carpeta del proyecto:

```bash
cd Ekklesias
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar en modo desarrollo:

```bash
npm run dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Genera la carpeta `out` con el sitio estático |
| `npm run start` | Sirve la versión ya construida (tras `npm run build`) |
| `npm run lint` | Ejecuta ESLint sobre el código |

---

## Estructura del proyecto

```
Ekklesias/
├── app/
│   ├── globals.css      # Estilos globales, variables CSS, secciones
│   ├── layout.tsx        # Layout raíz (fuentes, metadata)
│   └── page.tsx         # Página principal (todas las secciones)
├── public/
│   ├── image/           # Imágenes de la galería (01.jpeg … 06.jpeg)
│   └── abstract-bg.svg  # Fondo del body
├── next.config.mjs      # Configuración Next (output: 'export')
├── package.json
├── tsconfig.json
└── README.md
```

---

## Secciones de la página

1. **Pantalla de bienvenida (Lottie)**  
   - Animación al cargar la página con el texto "Bienvenidos a EKKLESIA".  
   - Se cierra al terminar la animación o tras 4 segundos.  
   - URL de la animación: constante `WELCOME_LOTTIE_URL` en `app/page.tsx`.

2. **Cabecera (topbar)**  
   - Logo "EK" + nombre "Ekklesias".  
   - Navegación: Ministerios, Eventos, Oración, Galería (anclas a las secciones).

3. **Hero**  
   - Título principal, breve descripción y botón "Ver eventos".  
   - Bloque "Hoy en Ekklesias" con lista rápida.  
   - Imagen de fondo desde Unsplash (comunidad).

4. **Ministerios activos**  
   - Tres tarjetas: Discipulado, Jóvenes y Familia, Misión y Servicio.  
   - Banner superior con imagen (Unsplash).

5. **Agenda semanal**  
   - Vista tipo calendario (7 días).  
   - Eventos fijos: Martes/Viernes Oración 06:00 h, Jueves/Domingo Reunión General 20:00 h, Sábado Reunión de Jóvenes 20:00 h.  
   - Bloque "Por definir": reunión mujeres/varones, clases de música, danza.

6. **Galería**  
   - Grid de imágenes (6 fotos) con tamaños variados.  
   - Imágenes en `public/image/01.jpeg` … `06.jpeg`.  
   - Clic en una imagen abre lightbox (imagen ampliada).  
   - Placeholder SVG si falla la carga de una imagen.

7. **Muro de oración**  
   - Fondo con imagen y overlay oscuro.  
   - Tagline, versículo (Filipenses 4:6), texto de fe y enlaces a redes (Facebook, Instagram).

8. **Patrocinador**  
   - Sección "Patrocinado por Osisgen" con enlace a [dev.osisg.com](https://dev.osisg.com/).  
   - Badges "Disponible próximamente" (App Store y Google Play).

---

## Personalización

### Imágenes de la galería

- Colocar las fotos en `public/image/` con nombres: `01.jpeg`, `02.jpeg`, … `06.jpeg`.  
- Títulos y disposición en la grid se editan en el array `galleryImages` en `app/page.tsx`.

### Agenda semanal

- Eventos fijos: array `schedule` en `app/page.tsx` (día, evento, hora, icono).  
- Actividades "Por definir": array `schedulePorDefinir`.

### Redes sociales

- Enlaces actuales en la sección Muro de oración (Facebook e Instagram).  
- Buscar en `app/page.tsx` los `href` de la clase `social-links` para cambiarlos.

### Animación de bienvenida

- Cambiar la animación Lottie: sustituir `WELCOME_LOTTIE_URL` en `app/page.tsx` por la URL JSON de cualquier animación en [LottieFiles](https://lottiefiles.com/).  
- Duración máxima en pantalla: constante `WELCOME_DURATION_MS` (por defecto 4000 ms).

### Imágenes de fondo (Unsplash)

- Hero, ministerios y muro de oración usan URLs en el objeto `visualImages` en `app/page.tsx`.  
- Puedes reemplazarlas por otras URLs o por rutas locales en `public/`.

### Versículo y textos del Muro de oración

- Objeto `prayerVerse` en `app/page.tsx` (texto y referencia).  
- Texto de fe: el párrafo con clase `faith-message`.

---

## Build y despliegue

El proyecto exporta un sitio estático:

```bash
npm run build
```

La salida se genera en la carpeta **`out/`**. Puedes subir el contenido de `out/` a cualquier hosting estático (Vercel, Netlify, GitHub Pages, servidor FTP, etc.) sin necesidad de Node en producción.

---

## Licencia

Proyecto privado. Uso interno de la comunidad Ekklesias.
