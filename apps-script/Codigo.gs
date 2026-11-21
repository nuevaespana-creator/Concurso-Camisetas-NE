/**
 * Votación del concurso de camisetas · Hogar Nueva España
 * Proyecto de Apps Script independiente, conectado a la Hoja por su ID.
 */
const CONFIG = {
  APERTURA: '2026-12-01T00:00:00+01:00',
  CIERRE:   '2026-12-05T23:59:59+01:00',
  NUM_DISENOS: 11,
  HOJA_ID: '1jOjZnBfNyd7U6WJeem1Zvl43mURH5J1h3afu3lTGAjA', // Hoja "Votos concurso camisetas"
  HOJA_VOTOS: 'Votos',
  HOJA_RESULTADOS: 'Resultados'
};

/** La Hoja ya está preparada (pestañas Votos y Resultados). Este script se conecta a ella por su ID. */

function doPost(e) {
  let salida;
  try {
    const datos = JSON.parse(e.postData.contents);
    if (datos.accion === 'votar') salida = votar_(datos);
    else salida = { ok: false, error: 'Acción no válida.' };
  } catch (err) {
    salida = { ok: false, error: 'No se ha podido registrar el voto. Inténtalo de nuevo.' };
  }
  return ContentService.createTextOutput(JSON.stringify(salida))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput('Servicio de votación activo.');
}

/** Correo en minúsculas; en Gmail ignora puntos y "+etiquetas" para que no sirvan para votar dos veces. */
function normalizarCorreo_(email) {
  let [usuario, dominio] = String(email).trim().toLowerCase().split('@');
  if (dominio === 'googlemail.com') dominio = 'gmail.com';
  if (dominio === 'gmail.com') usuario = usuario.split('+')[0].replace(/\./g, '');
  return usuario + '@' + dominio;
}

function votar_(datos) {
  const ahora = Date.now();
  const nombre = String(datos.nombre || '').trim().slice(0, 80);
  const enPlazo = ahora >= Date.parse(CONFIG.APERTURA) && ahora <= Date.parse(CONFIG.CIERRE);
  // Fuera de plazo solo se aceptan votos de prueba (nombre que empieza por PRUEBA), para borrarlos después
  const esPrueba = datos.prueba === true && /^prueba/i.test(nombre);
  if (!enPlazo && !esPrueba) return { ok: false, error: 'La votación no está abierta.' };
  const escrito = String(datos.email || '').trim().slice(0, 120);
  const diseno = Number(datos.diseno);
  if (nombre.length < 3) return { ok: false, error: 'Escribe tu nombre y apellidos.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(escrito)) return { ok: false, error: 'Revisa el correo electrónico.' };
  if (!Number.isInteger(diseno) || diseno < 1 || diseno > CONFIG.NUM_DISENOS) return { ok: false, error: 'Diseño no válido.' };

  const email = normalizarCorreo_(escrito);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // evita que dos votos del mismo correo entren a la vez
  try {
    const h = SpreadsheetApp.openById(CONFIG.HOJA_ID).getSheetByName(CONFIG.HOJA_VOTOS);
    if (!h) throw new Error('Falta la pestaña de votos. Ejecuta prepararHoja().');
    if (h.getLastRow() >= 2) {
      const repetido = h.getRange(2, 2, h.getLastRow() - 1, 1)
        .createTextFinder(email).matchEntireCell(true).matchCase(false).findNext();
      if (repetido) return { ok: false, error: 'Este correo ya ha votado.' };
    }
    // el apóstrofo evita que un texto que empiece por = se interprete como fórmula
    h.appendRow([new Date(), email, "'" + nombre, diseno, "'" + escrito]);
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
