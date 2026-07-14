// ============================================================
//  BLOODSITAX - Chequeo diario de cumpleaños
//  Corre 1 vez por dia via GitHub Actions.
//  Lee birthdays.json, filtra los cumples de hoy (hora Peru),
//  y postea en Discord via webhook: una mencion real que notifica
//  + un embed con la estetica BLOODSITAX y un GIF aleatorio (adjunto)
//  al final del recuadro.
// ============================================================

const fs = require('fs');
const path = require('path');

// ============================================================
//  CONFIGURACION - Edita solo esta seccion
// ============================================================

// Mensaje que va DENTRO del recuadro.
// Variable disponible:
//   {nombre}  -> se reemplaza por el nombre de la persona (birthdays.json), como TEXTO
// La etiqueta que NOTIFICA va aparte, arriba del recuadro (por ID).
// (Los caracteres estilizados, kaomojis y emojis van tal cual.)
const MENSAJE =
  '🎂 **𝑭𝒆𝒍𝒊𝒛 𝒄𝒖𝒎𝒑𝒍𝒆𝒂𝒏̃𝒐𝒔 {nombre}🎂 ⸜(๑˙꒳˙๑)⸝  𝑯𝑶𝒀 𝒆𝒓𝒆𝒔 𝒍𝒐 𝒎𝒂́𝒔 𝒎𝒂𝒋𝒆𝒔𝒕𝒖𝒐𝒔𝒐 𝒒𝒖𝒆 𝒗𝒆𝒓𝒂́ 𝒍𝒂 𝒄𝒂𝒔𝒂 ଘ(੭*ˊᵕˋ)੭* ੈ♡‧₊˚ 𝑷𝒖𝒆𝒅𝒆𝒔 𝒗𝒆𝒏𝒊𝒓 𝒂 𝒆𝒍𝒆𝒈𝒊𝒓 𝒍𝒂 𝒎𝒖́𝒔𝒊𝒄𝒂 𝒚 𝒑𝒂𝒔𝒂𝒓 𝒆𝒍 𝒓𝒊𝒕𝒖𝒂𝒍 𝒅𝒆 𝒄𝒖𝒎𝒑𝒍𝒆𝒂𝒏̃𝒐𝒔,  𝒓𝒆𝒄𝒖𝒆𝒓𝒅𝒂 𝒒𝒖𝒆 𝒔𝒊𝒆𝒎𝒑𝒓𝒆 𝒆𝒔𝒕𝒂𝒓𝒆𝒎𝒐𝒔 𝒑𝒂𝒓𝒂 𝒕𝒊 𝒑𝒆𝒓𝒐 𝒉𝒐𝒚 𝒆𝒔 𝒕𝒖 𝒅𝒊́𝒂 𝒆𝒔𝒑𝒆𝒄𝒊𝒂𝒍 𝒚 𝒔𝒊𝒆𝒎𝒑𝒓𝒆 𝒕𝒊𝒆𝒏𝒆 𝒒𝒖𝒆 𝒔𝒆𝒏𝒕𝒊𝒓𝒔𝒆 𝒂𝒔𝒊́ 💖₍ᐢ⑅•ᴗ•⑅ᐢ₎♡ +𝒊𝒏𝒗𝒊𝒕𝒂𝒔 𝒍𝒐𝒔 𝒕𝒂𝒄𝒐𝒔**';

// Color de la barra lateral del recuadro (neon pink BLOODSITAX #FF007F).
const COLOR = 0xff007f;

// -------- Lista de GIFs --------
// Son archivos DENTRO de la carpeta gifs/ del repo. El script elige UNO
// al azar y lo SUBE como adjunto (asi Discord siempre lo muestra).
// Para agregar mas: sube el archivo a gifs/ y agrega su nombre aqui.
const CARPETA_GIFS = 'gifs';
const GIFS = [
  'cumple1.gif',
  'cumple2.gif',
  'cumple3.gif',
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

// Elige un nombre de GIF al azar (o null si la lista esta vacia)
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

    // El cuerpo del embed (dentro del recuadro): solo el nombre como texto.
    // La etiqueta que notifica va aparte, en el "content" (abajo).
    const descripcion = MENSAJE.replaceAll('{nombre}', persona.nombre);

    // Elegir el GIF aleatorio y prepararlo como adjunto
    const nombreGif = gifAleatorio();
    let gifBuffer = null;
    if (nombreGif) {
      const ruta = path.join(CARPETA_GIFS, nombreGif);
      try {
        gifBuffer = fs.readFileSync(ruta);
      } catch (err) {
        console.warn(`[cumples] No se pudo leer ${ruta}: ${err.message}`);
      }
    }

    // Armar el embed con estetica BLOODSITAX. Si hay GIF, se referencia
    // como attachment:// para que salga DENTRO del recuadro, al final.
    const embed = {
      description: descripcion,
      color: COLOR,
    };
    if (gifBuffer) {
      embed.image = { url: `attachment://${nombreGif}` };
    }

    // Construir el envio. La mencion va en "content" (arriba, notifica).
    const payload = {
      content: mention,
      embeds: [embed],
      allowed_mentions: { parse: ['users'] },
    };

    // Enviar como multipart/form-data para poder adjuntar el GIF
    const form = new FormData();
    form.append('payload_json', JSON.stringify(payload));
    if (gifBuffer) {
      const blob = new Blob([gifBuffer], { type: 'image/gif' });
      form.append('files[0]', blob, nombreGif);
    }

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: form,
    });

    if (res.ok) {
      console.log(`[cumples] Felicitado: ${persona.nombre} (gif: ${nombreGif || 'ninguno'})`);
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
