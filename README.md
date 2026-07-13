# Cumpleaños BLOODSITAX (sin bot, sin servidor prendido, 100% gratis)

Sistema que anuncia cumpleaños en tu Discord automaticamente cada dia.
No usa Firebase. No usa un bot prendido 24/7. No cuesta nada.

Corre en la nube de GitHub una vez por dia, lee tu lista, y si alguien
cumple años ese dia, postea un recuadro (embed) con estetica BLOODSITAX,
un GIF aleatorio adentro, y etiqueta de verdad al cumpleañero.

---

## Como funciona (resumen)

- Tu lista de cumples vive en `birthdays.json` (la editas vos).
- GitHub Actions ejecuta un script 1 vez por dia (gratis).
- El script manda el mensaje a Discord por un Webhook (endpoint del canal).
- No hay bot: el webhook NO aparece en la lista de miembros, solo publica
  cuando toca. La etiqueta al cumpleañero notifica de verdad.

---

## PARTE 1 - Crear el Webhook en Discord

1. Abri tu servidor, anda al canal donde queres los anuncios.
2. Pasa el mouse sobre el canal -> engranaje (Editar canal).
3. Integraciones -> Webhooks -> Nuevo webhook.
4. Cambiale nombre (ej: "BLOODSITAX Cumples") y avatar si queres.
5. Clic en Copiar URL del webhook. Guardala para la Parte 4.

La URL es secreta. Nunca la pongas en el codigo ni en birthdays.json.

---

## PARTE 2 - Sacar los User IDs

Para etiquetar de verdad (que notifique) hace falta el ID numerico.

1. Discord -> Ajustes de usuario -> Avanzado -> activar Modo desarrollador.
2. Clic derecho sobre la persona -> Copiar ID de usuario.
3. Ese numero largo es su userId. Repeti por cada persona.

---

## PARTE 3 - Crear el repo en GitHub

1. https://github.com/new -> nombre bloodsitax-cumples. Publico o privado.
2. NO agregues README desde ahi (ya lo tenes).
3. Create repository.
4. Subir archivos: "uploading an existing file" -> arrastra
   birthdays.json, check-cumples.js, README.md
5. Para el workflow: Add file -> Create new file -> nombre exacto
   .github/workflows/cumples.yml -> pega el contenido -> Commit.

---

## PARTE 4 - Guardar el Webhook como secreto

1. En tu repo -> Settings -> Secrets and variables -> Actions.
2. New repository secret.
3. Name (exacto): DISCORD_WEBHOOK_URL
4. Secret: pega la URL del webhook de la Parte 1.
5. Add secret.

El nombre TIENE que ser exactamente DISCORD_WEBHOOK_URL.

---

## PARTE 5 - Cargar tu lista

1. En el repo, clic en birthdays.json -> lapiz (Edit).
2. Reemplaza el ejemplo por tu lista real:

```json
[
  { "nombre": "Bloody", "userId": "472839284729384712", "dia": 15, "mes": 3 },
  { "nombre": "Genry",  "userId": "998877665544332211", "dia": 7,  "mes": 9 }
]
```

Reglas:
- dia y mes son numeros (mes 1 = enero).
- userId va entre comillas.
- El ultimo bloque NO lleva coma al final.
- Si dudas, valida en https://jsonlint.com

Para agregar gente nueva: editas el archivo, agregas otro bloque, commit.

---

## PARTE 6 - Poner tus GIFs (seleccion aleatoria)

Los GIFs se configuran DENTRO de check-cumples.js, en la lista GIFS
(cerca del inicio del archivo). Ya viene con un GIF de cumpleaños de
ejemplo. El script elige UNO al azar cada vez:
- Con 1 GIF: siempre sale ese.
- Con varios: elige random en cada cumpleaños.

Se ve asi en el codigo:

```js
const GIFS = [
  'https://media.tenor.com/xxxxx.gif',
  'https://media.tenor.com/yyyyy.gif',
  'https://media.tenor.com/zzzzz.gif',
];
```

Para agregar mas: pega otra linea con el link entre comillas y coma.

### IMPORTANTE: como sacar el link DIRECTO de Tenor

El boton "Copiar enlace" de Tenor a veces da el link de la PAGINA
(ej: https://tenor.com/view/...) y ese NO se muestra bien en el embed.
Necesitas el link DIRECTO al archivo, que termina en .gif.

Forma segura de obtenerlo:
1. Abri el GIF en Tenor en el navegador (en la PC).
2. Clic derecho sobre el GIF -> "Abrir imagen en pestaña nueva" (o
   "Copiar direccion de imagen").
3. La URL que sale debe terminar en .gif (ej:
   https://media.tenor.com/AbCdEf123/nombre.gif). ESA es la que pegas.

Si usas Giphy: entra al GIF, clic derecho -> Copiar direccion de imagen.
Debe terminar en .gif tambien.

Cuando me pases tus links, si alguno no es directo te digo como
convertirlo.

---

## PARTE 7 - Probar sin esperar al cumple

1. Edita birthdays.json y pone a alguien (vos) con el dia y mes de HOY.
2. Repo -> pestaña Actions -> workflow "Cumpleaños BLOODSITAX".
3. Boton Run workflow -> Run workflow.
4. Espera ~30 seg, refresca. Ejecucion verde = OK.
5. Revisa el canal: debe estar el recuadro con el GIF etiquetando.
6. Volve a poner la fecha real.

Si falla, clic en la ejecucion roja -> el step -> lee el error.

---

## Personalizar

### El mensaje
Edita la constante MENSAJE arriba de check-cumples.js.
{mention} se reemplaza por la etiqueta real del cumpleañero.

### El color del recuadro
Constante COLOR. Ahora esta en neon pink BLOODSITAX (0xff007f).

### La hora del anuncio
Edita el cron en .github/workflows/cumples.yml.
GitHub usa hora UTC. Peru es UTC-5, sumale 5 horas:
- 9:00 AM Peru  -> 0 14 * * *
- 12:00 PM Peru -> 0 17 * * *
- 6:00 PM Peru  -> 0 23 * * *
- 8:00 PM Peru  -> 0 1 * * *

El cron de GitHub puede retrasarse 5-15 min si estan cargados. Para un
cumple no importa.

---

## Preguntas frecuentes

- Toca mi Firebase o mi agenda? No. Repo aparte, aislado.
- Cuanto cuesta? Cero. GitHub Actions da 2000 min/mes; esto usa ~15.
- Aparece un bot en la lista de miembros? No. Es un webhook, no aparece.
- Dos personas el mismo dia? Manda un mensaje separado para cada una.
