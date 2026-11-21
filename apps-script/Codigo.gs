/**
 * Votación del concurso de camisetas · Hogar Nueva España
 * Pegar en: Hoja de Google > Extensiones > Apps Script
 */
const CONFIG = {
  CLIENT_ID: 'PEGAR_AQUI_EL_ID.apps.googleusercontent.com', // el mismo que en index.html
  APERTURA: '2026-12-01T00:00:00+01:00',
  CIERRE:   '2026-12-05T23:59:59+01:00',
  NUM_DISENOS: 12,
  HOJA_VOTOS: 'Votos',
  HOJA_RESULTADOS: 'Resultados'
};

/** Ejecutar UNA vez a mano (botón ▶) para crear las pestañas. */
function prepararHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let v = ss.getSheetByName(CONFIG.HOJA_VOTOS);
  if (!v) v = ss.insertSheet(CONFIG.HOJA_VOTOS);
  v.getRange(1, 1, 1, 4).setValues([['Fecha', 'Email', 'Nombre', 'Diseño']]).setFontWeight('bold');
  v.setFrozenRows(1);

  let r = ss.getSheetByName(CONFIG.HOJA_RESULTADOS);
  if (!r) r = ss.insertSheet(CONFIG.HOJA_RESULTADOS);
  r.getRange('A1').setFormula(
    '=QUERY(' + CONFIG.HOJA_VOTOS + '!D2:D,"select D, count(D) where D is not null group by D order by count(D) desc label D \'Diseño\', count(D) \'Votos\'",0)'
  );
  r.getRange('D1').setValue('Total de votos');
  r.getRange('D2').setFormula('=COUNTA(' + CONFIG.HOJA_VOTOS + '!B2:B)');
}

function doPost(e) {
  let salida;
  try {
    const datos = JSON.parse(e.postData.contents);
    const usuario = verificarToken_(datos.token);
    if (datos.accion === 'estado') {
      salida = { ok: true, yaVotado: yaVotado_(usuario.email), abierta: estaAbierta_() };
    } else if (datos.accion === 'votar') {
      salida = votar_(usuario, Number(datos.diseno));
    } else {
      salida = { ok: false, error: 'Acción no válida.' };
    }
  } catch (err) {
    salida = { ok: false, error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(salida))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput('Servicio de votación activo.');
}

function verificarToken_(token) {
  if (!token) throw new Error('Inicia sesión con Google para votar.');
  const r = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
    { muteHttpExceptions: true }
  );
  if (r.getResponseCode() !== 200) throw new Error('Tu sesión ha caducado. Vuelve a iniciar sesión.');
  const p = JSON.parse(r.getContentText());
  if (p.aud !== CONFIG.CLIENT_ID) throw new Error('Sesión no válida. Vuelve a iniciar sesión.');
  if (String(p.email_verified) !== 'true') throw new Error('La cuenta de Google no está verificada.');
  return { email: String(p.email).toLowerCase(), nombre: p.name || '' };
}

function estaAbierta_() {
  const ahora = Date.now();
  return ahora >= Date.parse(CONFIG.APERTURA) && ahora <= Date.parse(CONFIG.CIERRE);
}

function hojaVotos_() {
  const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA_VOTOS);
  if (!h) throw new Error('Falta la pestaña de votos. Ejecuta prepararHoja().');
  return h;
}

function yaVotado_(email) {
  const h = hojaVotos_();
  if (h.getLastRow() < 2) return false;
  return !!h.getRange(2, 2, h.getLastRow() - 1, 1)
    .createTextFinder(email).matchEntireCell(true).matchCase(false).findNext();
}

function votar_(usuario, diseno) {
  if (!estaAbierta_()) return { ok: false, error: 'La votación no está abierta.' };
  if (!Number.isInteger(diseno) || diseno < 1 || diseno > CONFIG.NUM_DISENOS) {
    return { ok: false, error: 'Diseño no válido.' };
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // evita que dos votos de la misma cuenta entren a la vez
  try {
    if (yaVotado_(usuario.email)) return { ok: false, error: 'Esta cuenta ya ha votado.' };
    hojaVotos_().appendRow([new Date(), usuario.email, usuario.nombre, diseno]);
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
