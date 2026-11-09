const pending = '<p class="notice">Contenido inicial editable desde el panel administrativo. Revisa y completa los datos marcados con [COMPLETAR] antes de publicar.</p>';

module.exports = {
  settings: {
    instagram: '', tiktok: '', youtube: '', discord: '', email: '',
    ceo: '', legal_name: '', legal_id: '', legal_address: '', privacy_email: '', updated: '2026-11-09'
  },
  staffPositions: ['CEO y fundador', 'Director deportivo', 'Manager', 'Coach', 'Analista', 'Community Manager', 'Diseñador'],
  faqs: [
    ['¿Qué es IMPERIUM ESPORTS?', 'Es una organización independiente de esports con sede administrativa en Colombia, enfocada en Free Fire Battle Royale.'],
    ['¿En qué región compite?', 'Nuestra región competitiva inicial es LATAM Norte.'],
    ['¿Cómo puedo ingresar?', 'Completa el formulario de la sección Reclutamiento. Si tu perfil encaja, podrás ser invitado a un tryout.'],
    ['¿Cuál es la edad mínima?', 'La edad mínima para postularse es de 16 años. Los menores de 18 necesitan autorización de su representante legal.'],
    ['¿Cómo funcionan los tryouts?', 'Son pruebas competitivas con fechas y requisitos publicados en la sección Tryouts. El staff evalúa mecánicas, comunicación, trabajo en equipo, rotaciones, decisiones, conocimiento del juego, disciplina y potencial.'],
    ['¿Necesito experiencia competitiva?', 'No es obligatoria, pero valoramos el nivel competitivo y el potencial de crecimiento.'],
    ['¿Puedo postularme desde otro país?', 'Sí. Reclutamos en toda Latinoamérica, sujeto a las reglas de elegibilidad de cada competición.'],
    ['¿Cómo puedo contactar con la organización?', 'Usa el formulario de la sección Contacto o nuestras redes oficiales.'],
    ['¿Cómo puedo proponer un patrocinio?', 'Escríbenos desde Contacto eligiendo el motivo «Patrocinios».']
  ],
  pages: [
    { slug: 'nosotros', title: 'Sobre nosotros', body: `<h2>Quiénes somos</h2><p>IMPERIUM ESPORTS (IMPX) es una organización competitiva independiente con sede administrativa en Colombia. Compite en Free Fire Battle Royale en la región LATAM Norte y recluta talento en toda Latinoamérica.</p>
<h2>Construyendo un legado</h2><p>IMPERIUM ESPORTS nace con la ambición de convertirse en una organización reconocida dentro del competitivo de Free Fire. Nuestro objetivo no es simplemente participar: es construir un legado.</p>
<h2>Misión</h2><p>Formar y acompañar talento competitivo con disciplina, profesionalismo y unión. [COMPLETAR]</p>
<h2>Visión</h2><p>Llegar al máximo nivel de los esports latinoamericanos. [COMPLETAR]</p>
<h2>Valores</h2><ul><li>Autoridad</li><li>Disciplina</li><li>Ambición</li><li>Competitividad</li><li>Profesionalismo</li><li>Unión</li><li>Excelencia</li></ul>
<h2>Objetivos</h2><p>Corto, mediano y largo plazo: [COMPLETAR].</p><h2>Filosofía competitiva</h2><p>[COMPLETAR]</p><h2>Historia</h2><p>[COMPLETAR]</p>` },
    { slug: 'equipos', title: 'Equipos competitivos', body: `<h2>División Free Fire Battle Royale</h2><p><strong>Región:</strong> LATAM Norte · <strong>Tag:</strong> IMPX</p><p>Plantilla, manager, coach, estado competitivo e historial se publican en las secciones Roster, Staff y Resultados a medida que se confirmen.</p><p>Esta arquitectura está preparada para nuevas modalidades, videojuegos, regiones, equipos femeninos y divisiones juveniles.</p>` },
    { slug: 'comunidad', title: 'Comunidad IMPERIUM', body: `<p>Únete a la comunidad: acceso al Discord oficial, anuncios, eventos y actividades. Los enlaces oficiales están en el pie de página y se configuran desde el panel.</p><p>Eventos comunitarios: Próximamente.</p>` },
    { slug: 'prensa', title: 'Prensa y medios', body: `<h2>Información institucional</h2><p>IMPERIUM ESPORTS · IMPX · Free Fire Battle Royale · LATAM Norte · Sede administrativa en Colombia.</p><h2>Colores corporativos</h2><p>Negro profundo, dorado metálico y blanco.</p><h2>Kit de prensa</h2><p><a href="/img/logo.png" download>Descargar logo (PNG)</a> · <a href="/img/banner.jpg" download>Descargar banner</a></p><p>Contacto de prensa: usa el formulario de Contacto con el motivo «Prensa».</p>` },
    { slug: 'terminos', title: 'Términos y condiciones', body: `${pending}<ol>
<li><strong>Identificación del sitio:</strong> sitio oficial de IMPERIUM ESPORTS. Responsable: [COMPLETAR razón social, NIT y domicilio].</li>
<li><strong>Aceptación:</strong> al usar el sitio aceptas estos términos.</li>
<li><strong>Condiciones de uso:</strong> uso personal, lícito y de buena fe.</li>
<li><strong>Propiedad intelectual:</strong> contenidos, diseños y marcas pertenecen a IMPERIUM ESPORTS o a sus titulares.</li>
<li><strong>Uso del logo y la marca:</strong> prohibido sin autorización escrita.</li>
<li><strong>Normas de conducta:</strong> respeto y cumplimiento del Código de conducta.</li>
<li><strong>Suplantación:</strong> prohibido suplantar a miembros, staff o terceros.</li>
<li><strong>Contenido ilegal:</strong> prohibido publicar o enviar contenido ilegal u ofensivo.</li>
<li><strong>Formularios y postulaciones:</strong> la información debe ser veraz. Enviar una solicitud no garantiza la incorporación.</li>
<li><strong>Enlaces externos:</strong> no respondemos por el contenido de sitios de terceros.</li>
<li><strong>Disponibilidad:</strong> el sitio puede interrumpirse por mantenimiento.</li>
<li><strong>Limitación de responsabilidad:</strong> en la medida permitida por la ley aplicable.</li>
<li><strong>Modificaciones:</strong> podemos actualizar estos términos; rige la versión publicada.</li>
<li><strong>Legislación y contacto:</strong> legislación colombiana. Contacto: formulario del sitio.</li></ol>
<p>IMPERIUM ESPORTS es una organización independiente. No es una entidad oficial de Garena ni organiza torneos oficiales sin autorización.</p>` },
    { slug: 'privacidad', title: 'Política de privacidad y tratamiento de datos', body: `${pending}<p>Esta política se rige por la Ley 1581 de 2012, el Decreto 1074 de 2015 (en lo pertinente) y normas complementarias de Colombia.</p>
<h2>Responsable</h2><p>[COMPLETAR razón social, NIT, domicilio y correo].</p>
<h2>Información que recopilamos</h2><p>Datos de postulación (nombre, edad, país, nickname, ID de jugador, redes, disponibilidad, dispositivo, descripción) y datos de contacto (nombre, correo, mensaje).</p>
<h2>Finalidad</h2><p>Gestionar postulaciones y tryouts, responder consultas y comunicaciones oficiales.</p>
<h2>Almacenamiento y acceso</h2><p>En base de datos con acceso restringido al staff autorizado por rol. No se publican datos de aspirantes.</p>
<h2>Conservación</h2><p>Mientras sea necesario para la finalidad o lo exija la ley. [COMPLETAR plazos]</p>
<h2>Seguridad</h2><p>HTTPS, contraseñas cifradas, control de acceso y registro de actividad.</p>
<h2>Derechos de los titulares</h2><p>Consultar, actualizar, corregir, suprimir cuando proceda y revocar la autorización. Solicítalo desde <a href="/contacto?motivo=Derechos+sobre+datos+personales">Contacto</a>. Atenderemos consultas y reclamos en los plazos de la ley.</p>
<h2>Menores de edad</h2><p>Solo se aceptan postulaciones desde los 16 años; los menores de 18 requieren autorización del representante legal y se protege el interés superior del menor.</p>
<h2>Cookies</h2><p>Ver <a href="/cookies">Política de cookies</a>.</p>
<h2>Transferencias y transmisiones</h2><p>Los datos se alojan con proveedores de infraestructura que actúan como encargados. [COMPLETAR]</p>` },
    { slug: 'cookies', title: 'Política de cookies', body: `<h2>¿Qué son?</h2><p>Pequeños archivos que el sitio guarda en tu dispositivo.</p>
<h2>Cookies que usamos</h2><ul><li><strong>Necesarias:</strong> sesión y seguridad. Siempre activas.</li><li><strong>Preferencias:</strong> recuerdan tu elección de cookies.</li><li><strong>Analíticas y de terceros:</strong> no se instalan actualmente. Si se agregan, solo se activarán con tu consentimiento.</li></ul>
<h2>Administrar preferencias</h2><p><button class="btn" data-cookie-settings>Configurar cookies</button></p>` },
    { slug: 'conducta', title: 'Código de conducta', body: `<p>Aplica a jugadores, staff y comunidad.</p><ul><li>Respeto hacia todas las personas.</li><li>Disciplina y puntualidad.</li><li>Juego limpio.</li><li>Prohibido usar hacks o programas ilegales.</li><li>Prohibido participar en trampas o amaños.</li><li>No discriminar ni acosar.</li><li>Cumplir los compromisos adquiridos.</li><li>Proteger la reputación de la organización.</li><li>Respetar las reglas de cada competición.</li></ul>
<h2>Reportes</h2><p>Envía tu reporte desde <a href="/contacto?motivo=Asuntos+administrativos">Contacto</a>. El staff lo revisa con confidencialidad.</p>
<h2>Medidas disciplinarias</h2><p>Proporcionales a la falta: advertencia, suspensión temporal o retiro de la organización.</p>` },
    { slug: 'politica-reclutamiento', title: 'Política de reclutamiento y participación', body: `${pending}<ul><li><strong>Requisitos:</strong> edad mínima de 16 años, ID de jugador válido, disponibilidad de entrenamiento.</li><li><strong>Proceso:</strong> postulación, revisión, preselección, tryout y evaluación.</li><li><strong>Criterios:</strong> mecánicas, comunicación, trabajo en equipo, rotaciones, decisiones, conocimiento del juego, disciplina y potencial.</li><li><strong>Comunicación oficial:</strong> solo por los canales oficiales de la organización.</li><li><strong>Confidencialidad:</strong> tu información no se publica.</li></ul><p><strong>Enviar una solicitud no garantiza la incorporación al equipo.</strong></p>` }
  ]
};
