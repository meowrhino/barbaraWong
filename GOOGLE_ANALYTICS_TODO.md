# Google Analytics — pasos pendientes (con Bárbara)

El snippet de GA4 ya está colocado en [index.html](index.html) (justo antes de `</head>`) con un placeholder `G-XXXXXXXXXX` en 2 sitios. Falta crear la propiedad y reemplazar el ID.

## 1. Crear la propiedad en Google Analytics

Entrar con la cuenta de Google de Bárbara en https://analytics.google.com → pulsar **Empezar a medir** y seguir el asistente:

### Paso 1 — Configuración de la cuenta
- **Nombre de la cuenta:** `Bárbara Sánchez Barroso` (es solo organizativo)
- Aceptar los checkboxes por defecto de uso compartido de datos

### Paso 2 — Configuración de la propiedad
- **Nombre de la propiedad:** `barbarawong.info`
- **Zona horaria:** `(GMT+01:00) Madrid`
- **Moneda:** `Euro (€)`

### Paso 3 — Acerca de tu empresa
- **Sector:** Artes y entretenimiento (o similar)
- **Tamaño:** el más pequeño
- **Uso previsto:** marcar cualquiera, no afecta al tracking

### Paso 4 — Objetivos comerciales
- Marcar **"Ver informes de usuarios y comportamiento"** — suficiente para una web personal

### Paso 5 — Aceptar términos
- Seleccionar país: **España**

### Paso 6 — Plataforma: Web
- **URL del sitio:** `https://barbarawong.info` (sin barra final, en HTTPS)
- **Nombre del flujo:** `barbarawong.info`
- Dejar **"Medición mejorada"** activada

### Paso 7 — Copiar el Measurement ID
Al terminar, GA muestra arriba a la derecha el **Measurement ID** con formato `G-XXXXXXXXXX`. Copiarlo.

## 2. Sustituir el ID en el código

En [index.html](index.html), reemplazar las **2 ocurrencias** de `G-XXXXXXXXXX` por el ID real:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  ...
  gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
</script>
```

Commit + push. Al cabo de unos minutos, en **Informes → Tiempo real** de GA debería verse la visita actual.

## 3. (Opcional) Verificar

- Abrir https://barbarawong.info en una ventana de incógnito
- En GA → Informes → Tiempo real → debería aparecer 1 usuario activo
- Si no aparece tras 5 min: revisar consola del navegador, comprobar que no hay un adblocker bloqueando `googletagmanager.com`

## 4. (Opcional) Privacidad

- El snippet ya incluye `anonymize_ip: true` (cumple RGPD básico)
- Si Bárbara quiere ser estricta con cookies, habría que añadir un banner de consentimiento — pendiente de decidir
