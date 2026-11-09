# IMPERIUM ESPORTS · IMPX

Plataforma web oficial: sitio público, reclutamiento, tryouts, noticias, torneos, resultados y panel administrativo.
Stack: Node 20+, Express 5, EJS, PostgreSQL, sesiones en base de datos.

## Estructura

| Archivo | Apartado |
|---|---|
| `server.js` | Arranque, seguridad (helmet, CSP, sesiones, CSRF) |
| `src/db.js`, `sql/schema.sql`, `src/seed.js` | Base de datos, tablas y contenido inicial editable |
| `src/middleware.js` | CSRF, límites de intentos, roles y permisos, registro de actividad |
| `src/routes/site.js` | Inicio, Nosotros, Equipos, Comunidad, Prensa, legales, FAQ, Patrocinadores, Contacto, sitemap, robots |
| `src/routes/team.js` | Roster y Staff |
| `src/routes/compete.js` | Noticias, Torneos, Resultados |
| `src/routes/recruit.js` | Reclutamiento, estado de postulación, Tryouts |
| `src/routes/admin.js`, `src/routes/admin-extra.js`, `src/resources.js` | Acceso privado, panel, usuarios, invitaciones a tryouts, inscritos y copia de seguridad |
| `src/routes/portal.js` | Portal privado de jugadores y staff |
| `src/routes/media.js` | Biblioteca de archivos (imágenes y PDF guardados en la base de datos) y sala de prensa |
| `src/routes/rights.js` | Solicitudes de derechos sobre datos personales |
| `src/charts.js`, `src/captcha.js` | Gráficos SVG y protección antispam |
| `views/` | Plantillas por sección (`views/admin/` para el panel) |
| `public/` | CSS, JS, logo y banner |

## Despliegue en Render

1. Sube la carpeta a un repositorio de GitHub.
2. En Render: **New → Blueprint** y selecciona el repositorio (usa `render.yaml`: crea la web y la base PostgreSQL).
3. Cuando lo pida, define: `SITE_URL` (https://tu-dominio), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 12 caracteres) y, opcional, `NOTIFY_WEBHOOK_URL` (webhook de un canal de Discord para avisar de nuevas postulaciones).
4. Al primer arranque se crean las tablas, el contenido inicial y el superadministrador.
5. Entra en `/acceso`, ve a **Ajustes** y completa redes, CEO y datos legales (razón social, NIT, domicilio, correo de datos).
6. Revisa y completa los textos marcados con `[COMPLETAR]` en **Páginas**. Los textos legales deben ser revisados por un abogado antes de publicar.
7. Dominio propio: Render → Settings → Custom Domains, y crea el registro DNS que indique. HTTPS es automático.
8. Copias de seguridad: usa un plan de pago de PostgreSQL en Render (incluye backups) o programa `pg_dump`.

## Desarrollo local

```
cp .env.example .env
npm install
npm run dev
npm test
```

## Roles

superadmin y admin: todo · editor: noticias, páginas, FAQ, patrocinadores, mensajes, archivos · manager: roster, staff, equipos, torneos, resultados, estadísticas, tryouts, comunicados, entrenamientos, documentos, archivos · reclutador: postulaciones, tryouts, mensajes · jugador y staff: solo el portal privado (`/portal`).
Solo el superadmin exporta copias de seguridad. Crea jugadores y staff en Panel → Usuarios.

## Imágenes y archivos

Sube fotos, logos y PDF en Panel → Archivos (máx. 4 MB, se guardan en PostgreSQL). Copia la dirección `/media/ID` y pégala en los campos de foto, logo o imagen. Marca «kit de prensa» para publicarlos en `/prensa`.

## Antispam

Siempre activos: campo trampa, tiempo mínimo de envío y límite por IP. Opcional: Cloudflare Turnstile gratuito; define `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` en Render.

## Copias de seguridad

Panel → Copia descarga un JSON con todo el contenido (sin contraseñas ni binarios). La base de datos de pago de Render también incluye copias automáticas.
