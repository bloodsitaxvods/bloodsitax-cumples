// ============================================================
//  BLOODSITAX - Chequeo diario de cumpleaños
//  Corre 1 vez por dia via GitHub Actions.
//  Lee birthdays.json, filtra los cumples de hoy (hora Peru),
//  y postea en Discord via webhook: una mencion real que notifica
//  + un embed con la estetica BLOODSITAX y un GIF aleatorio dentro.
// ============================================================

const fs = require('fs');

// ============================================================
//  CONFIGURACION - Edita solo esta seccion
// ============================================================

// Mensaje que va DENTRO del recuadro.
// Variable disponible:
//   {mention} -> se reemplaza por la etiqueta del cumpleañero
// (Los caracteres estilizados, kaomojis y emojis van tal cual.)
const MENSAJE =
  '🎂 **𝑭𝒆𝒍𝒊𝒛 𝒄𝒖𝒎𝒑𝒍𝒆𝒂𝒏̃𝒐𝒔 🎂 ⸜(๑˙꒳˙๑)⸝  {mention}  𝑯𝑶𝒀 𝒆𝒓𝒆𝒔 𝒍𝒐 𝒎𝒂́𝒔 𝒎𝒂𝒋𝒆𝒔𝒕𝒖𝒐𝒔𝒐 𝒒𝒖𝒆 𝒗𝒆𝒓𝒂́ 𝒍𝒂 𝒄𝒂𝒔𝒂 ଘ(੭*ˊᵕˋ)੭* ੈ♡‧₊˚ 𝑷𝒖𝒆𝒅𝒆𝒔 𝒗𝒆𝒏𝒊𝒓 𝒂 𝒆𝒍𝒆𝒈𝒊𝒓 𝒍𝒂 𝒎𝒖́𝒔𝒊𝒄𝒂 𝒚 𝒑𝒂𝒔𝒂𝒓 𝒆𝒍 𝒓𝒊𝒕𝒖𝒂𝒍 𝒅𝒆 𝒄𝒖𝒎𝒑𝒍𝒆𝒂𝒏̃𝒐𝒔,  𝒓𝒆𝒄𝒖𝒆𝒓𝒅𝒂 𝒒𝒖𝒆 𝒔𝒊𝒆𝒎𝒑𝒓𝒆 𝒆𝒔𝒕𝒂𝒓𝒆𝒎𝒐𝒔 𝒑𝒂𝒓𝒂 𝒕𝒊 𝒑𝒆𝒓𝒐 𝒉𝒐𝒚 𝒆𝒔 𝒕𝒖 𝒅𝒊́𝒂 𝒆𝒔𝒑𝒆𝒄𝒊𝒂𝒍 𝒚 𝒔𝒊𝒆𝒎𝒑𝒓𝒆 𝒕𝒊𝒆𝒏𝒆 𝒒𝒖𝒆 𝒔𝒆𝒏𝒕𝒊𝒓𝒔𝒆 𝒂𝒔𝒊́ 💖₍ᐢ⑅•ᴗ•⑅ᐢ₎♡ +𝒊𝒏𝒗𝒊𝒕𝒂𝒔 𝒍𝒐𝒔 𝒕𝒂𝒄𝒐𝒔**';

// Color de la barra lateral del recuadro (neon pink BLOODSITAX #FF007F).
const COLOR = 0xff007f;

// -------- Lista de GIFs --------
// El script elige UNO al azar cada vez. Pega aqui tus links.
// Con 1 solo, siempre sale ese. Con varios, elige random.
// IMPORTANTE: el link debe ser DIRECTO al archivo (terminar en .gif),
// no el link de la pagina de Tenor. Ver el README (PARTE 6).
const GIFS = [
  'https://raw.githubusercontent.com/bloodsitaxvods/bloodsitax-cumples/main/gifs/cumple1.gif',
  'https://raw.githubusercontent.com/bloodsitaxvods/bloodsitax-cumples/main/gifs/cumple2.gif',
  'https://raw.githubusercontent.com/bloodsitaxvods/bloodsitax-cumples/main/gifs/cumple3.gif',
];

// Zona horaria para determinar "que dia es hoy"
const ZONA_HORARIA = 'America/Lima';

// ============================================================
//  Logica - No hace falta tocar de aca para abajo
// ============================================================

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error('ERROR: falta la variable DISCORD_WEBHOOK_URL');
  process.exit(1);
}

// Determinar la fecha de hoy en la zona horaria configurada
const ahora = new Date(
  new Date().toLocaleString('en-US', { timeZone: ZONA_HORARIA })
);
const diaHoy = ahora.getDate();
const mesHoy = ahora.getMonth() + 1;

console.log(`[cumples] Fecha en ${ZONA_HORARIA}: ${diaHoy}/${mesHoy}`);

// Leer la lista
let lista;
try {
  lista = JSON.parse(fs.readFileSync('birthdays.json', 'utf8'));
} catch (err) {
  console.error('ERROR leyendo birthdays.json:', err.message);
  process.exit(1);
}

// Filtrar cumples de hoy
const cumplesHoy = lista.filter((p) => p.dia === diaHoy && p.mes === mesHoy);

if (cumplesHoy.length === 0) {
  console.log('[cumples] Nadie cumple hoy. Fin.');
  process.exit(0);
}

console.log(
  `[cumples] Cumplen hoy: ${cumplesHoy.map((p) => p.nombre).join(', ')}`
);

// Elige un GIF al azar de la lista (o null si la lista esta vacia)
function gifAleatorio() {
  if (!GIFS || GIFS.length === 0) return null;
  const i = Math.floor(Math.random() * GIFS.length);
  return GIFS[i];
}

// Enviar un mensaje por cada cumpleañero
async function enviar() {
  for (const persona of cumplesHoy) {
    if (!persona.userId || persona.userId === 'PEGA_AQUI_EL_ID') {
      console.warn(
        `[cumples] ${persona.nombre} no tiene userId valido, se omite.`
      );
      continue;
    }

    const mention = `<@${persona.userId}>`;

    // El cuerpo del embed (dentro del recuadro), con la etiqueta puesta
    const descripcion = MENSAJE.replaceAll('{mention}', mention);

    // Armar el embed con estetica BLOODSITAX
    const embed = {
      description: descripcion,
      color: COLOR,
    };

    // Adjuntar el GIF dentro del recuadro (si hay lista)
    const gif = gifAleatorio();
    if (gif) {
      embed.image = { url: gif };
    }

    // La mencion va tambien en el "content" (fuera del embed) para que
    // Discord dispare la notificacion real al usuario. Dentro del
    // embed la mencion se ve pero NO notifica.
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: mention,
        embeds: [embed],
        allowed_mentions: { parse: ['users'] },
      }),
    });

    if (res.ok) {
      console.log(`[cumples] Felicitado: ${persona.nombre}`);
    } else {
      const body = await res.text();
      console.error(
        `[cumples] Fallo con ${persona.nombre}: ${res.status} ${body}`
      );
    }

    // Pequeña pausa para no gatillar rate limit si hay varios
    await new Promise((r) => setTimeout(r, 600));
  }
}

enviar().then(() => console.log('[cumples] Listo.'));
