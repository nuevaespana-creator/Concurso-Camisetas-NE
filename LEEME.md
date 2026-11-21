# Votación del concurso de camisetas · Hogar Nueva España

Web en GitHub Pages + Hoja de Google como almacén de votos.
Quien vota escribe su nombre y su correo; cada correo solo puede votar una vez. Los resultados solo se ven en la Hoja.

## Estructura
```
index.html                         → la web (configuración arriba del <script>)
estilos.css, tokens.css, base.css  → el diseño
logo.png
disenos/01.jpg … 12.jpg
apps-script/Codigo.gs              → código para la Hoja de Google
```

## Paso 1 · El servidor (Apps Script)
La Hoja "Votos concurso camisetas" ya está creada en la carpeta de los diseños, con las pestañas *Votos* y *Resultados*.
1. Abre la Hoja → *Extensiones → Apps Script*.
2. Borra lo que haya y pega `apps-script/Codigo.gs`. Guarda (icono del disquete).
3. *Implementar → Nueva implementación → ⚙ → Aplicación web*:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
4. Autoriza los permisos (si sale "Google no ha verificado esta aplicación": *Configuración avanzada → Ir a…*; es tu propio script).
5. Copia la URL que termina en `/exec`.

> Si cambias el código después: *Implementar → Gestionar implementaciones → ✏ editar → Versión: Nueva versión*. Así la URL no cambia.

## Paso 2 · Conectar la web
En `index.html`, dentro de `CONFIG`, pega la URL en `SCRIPT_URL` y súbelo a GitHub.
Mientras `SCRIPT_URL` esté vacío, la web funciona en **modo demostración** (no guarda nada).

## Paso 3 · Probar antes de difundir
Abre la web añadiendo `?prueba` al final de la dirección. En ese modo se puede votar antes del 1 de diciembre, pero solo con un nombre que empiece por **PRUEBA** (por ejemplo "PRUEBA Fer").
Vota y comprueba que aparece en *Votos*. Intenta votar otra vez con el mismo correo: debe decir "Este correo ya ha votado". Después **borra las filas de prueba** de la pestaña *Votos*.
Sin `?prueba`, la web no deja votar hasta el 1 de diciembre.

## Cómo se evita el voto doble
- La Hoja rechaza un correo que ya ha votado. En Gmail ignora puntos y "+etiquetas" (`ana.perez+1@gmail.com` cuenta como `anaperez@gmail.com`).
- El navegador recuerda que ya se votó desde ese dispositivo.
- Los correos **no se verifican**: alguien podría inventarse correos para votar más de una vez. Antes de anunciar el ganador, revisa la pestaña *Votos* (nombres falsos, correos raros, muchos votos seguidos al mismo diseño en pocos minutos) y borra lo que no sea válido. Para eso están previstos los días de recuento del 6 al 18 de diciembre.

## Notas
- Las fechas que mandan son las de `Codigo.gs`: el servidor rechaza votos fuera de plazo o de diseños que no existen, aunque alguien manipule la web.
- Al terminar el concurso, borra la pestaña *Votos* (contiene nombres y correos).
- No subas a GitHub la tabla de correspondencia de diseños y autores: el repositorio es público.
