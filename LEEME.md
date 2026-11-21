# Votación del concurso de camisetas · Hogar Nueva España

Web en GitHub Pages + Hoja de Google como almacén de votos.
Cada cuenta de Google puede votar **una sola vez**. Los diseños van numerados y los resultados solo se ven en la Hoja.

## Estructura
```
index.html            → la web (configuración arriba del <script>)
estilos.css, tokens.css, base.css → el diseño
logo.png
disenos/01.jpg … 15.jpg
apps-script/Codigo.gs → código para la Hoja de Google (no hace falta subirlo a GitHub)
```

## Paso 1 · Las imágenes
Sustituye las imágenes de ejemplo de `disenos/` por las reales: `01.jpg`, `02.jpg`… (si son .png, cambia `EXTENSION` en `index.html`).
Ajusta `NUM_DISENOS` en `index.html` y en `Codigo.gs`.

## Paso 2 · ID de cliente de Google (para "Iniciar sesión con Google")
1. Entra en https://console.cloud.google.com con la cuenta del Hogar → crea un proyecto ("Votación camisetas").
2. *APIs y servicios → Pantalla de consentimiento de OAuth*: tipo **Externo**, nombre de la app, correo de contacto. Sin permisos extra. Al terminar, pulsa **Publicar aplicación** (si se queda en "Prueba", solo podrán entrar las cuentas que añadas a mano).
3. *Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web*.
   En **Orígenes de JavaScript autorizados** añade: `https://TU-USUARIO.github.io`
4. Copia el ID (termina en `.apps.googleusercontent.com`).

## Paso 3 · La Hoja de Google
1. Crea una Hoja nueva ("Votos camisetas").
2. *Extensiones → Apps Script* → borra lo que haya y pega `Codigo.gs`.
3. Rellena `CLIENT_ID`, `APERTURA`, `CIERRE` y `NUM_DISENOS`. Guarda.
4. Elige la función `prepararHoja` y pulsa ▶ Ejecutar (te pedirá permisos: acéptalos). Se crean las pestañas *Votos* y *Resultados*.
5. *Implementar → Nueva implementación → Aplicación web*:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Copia la URL que termina en `/exec`.

> Si cambias el código después, usa *Implementar → Gestionar implementaciones → editar → Nueva versión* para que la URL siga siendo la misma.

## Paso 4 · Conectar la web
En `index.html`, dentro de `CONFIG`, pega `SCRIPT_URL` (la URL `/exec`) y `CLIENT_ID`, y pon las mismas fechas que en la Hoja.
Mientras alguno de los dos esté vacío, la web funciona en **modo demostración** (no guarda nada).

## Paso 5 · Publicar en GitHub Pages
1. Crea un repositorio público (p. ej. `camisetas-ne`) y sube `index.html`, `estilos.css`, `tokens.css`, `base.css`, `logo.png` y la carpeta `disenos/`.
2. *Settings → Pages → Deploy from a branch → main / (root)*.
3. La web quedará en `https://TU-USUARIO.github.io/camisetas-ne/`.

## Paso 6 · Probar antes de difundir
Vota con tu cuenta y comprueba que aparece en *Votos*. Intenta votar otra vez: debe decir "Esta cuenta ya ha votado". Borra esa fila de prueba y comparte el enlace.

## Notas
- Las fechas que mandan son las de `Codigo.gs`: aunque alguien manipule la web, el servidor rechaza votos fuera de plazo, duplicados o de diseños que no existen.
- Quien vote necesita una cuenta de Google.
- Al terminar el concurso, borra la pestaña *Votos* (contiene correos) cuando ya no la necesites.
