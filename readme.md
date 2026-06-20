# Baby Tracker — Guía de instalación en Netlify

## Archivos del proyecto
```
babytracker/
├── index.html      ← App principal
├── style.css       ← Estilos
├── app.js          ← Lógica de la app
├── sw.js           ← Service Worker (modo offline)
├── manifest.json   ← Configuración PWA
├── _redirects      ← Necesario para Netlify
└── icons/
    ├── icon-192.png  ← Ícono app (192x192 px)
    └── icon-512.png  ← Ícono app (512x512 px)
```

---

## Paso 1 — Crear los íconos

Necesitas dos íconos PNG del bebé. Opciones gratuitas:
- Ve a https://favicon.io/emoji-favicons/
- Busca "baby" → descarga
- Renombra los archivos a icon-192.png e icon-512.png
- Ponlos en la carpeta icons/

---

## Paso 2 — Subir a Netlify (GRATIS)

### Opción A — Arrastrar y soltar (más fácil, 2 minutos)
1. Ve a https://netlify.com y crea cuenta gratis
2. En el dashboard, busca el área que dice **"drag and drop your site folder here"**
3. Arrastra TODA la carpeta `babytracker/` ahí
4. Netlify te da una URL como: `https://nombre-aleatorio.netlify.app`
5. ¡Listo! Esa es tu URL permanente

### Opción B — Desde GitHub (recomendado para actualizaciones)
1. Sube la carpeta a un repositorio en github.com
2. En Netlify → "Add new site" → "Import from Git"
3. Conecta tu repo → Deploy
4. Cada vez que actualices el repo, Netlify actualiza la app automáticamente

---

## Paso 3 — Instalar como app en el teléfono

### Android (Chrome):
1. Abre la URL de Netlify en Chrome
2. Toca los 3 puntos (⋮) arriba a la derecha
3. Toca **"Añadir a pantalla de inicio"**
4. Confirma → Ya aparece como app en tu teléfono

### iPhone (Safari):
1. Abre la URL en Safari (no Chrome)
2. Toca el botón de compartir (□↑)
3. Toca **"Agregar a pantalla de inicio"**
4. Confirma → Ya aparece como app

---

## ¿Dónde se guardan los datos?

```
Tu teléfono (localStorage del navegador)
     ↓
  SOLO en tu dispositivo
  No sale a internet
     ↓
Respaldo manual → Google Drive (tú decides cuándo)
```

**Importante:** Los datos viven en el teléfono donde usas la app.
Si tu esposa usa su propio teléfono, necesita restaurar desde el respaldo .json.

---

## Respaldo a Google Drive (como WhatsApp)

1. Abre la app → Resumen → "Descargar respaldo (.json)"
2. El archivo se descarga en tu teléfono
3. Abre Google Drive → Crea carpeta "BabyTracker"
4. Sube el archivo .json ahí

Para restaurar en otro teléfono:
1. Descarga el .json desde Google Drive
2. Abre la app → Resumen → "Restaurar respaldo"
3. Selecciona el archivo → ¡Datos restaurados!

---

## Dominio personalizado (opcional)

Si quieres usar algo como `bebe.tudominio.com`:
1. En Netlify → Domain settings → Add custom domain
2. Sigue las instrucciones para apuntar tu DNS

---

## Soporte offline

Una vez instalada como PWA, **funciona sin internet**.
El Service Worker guarda todos los archivos en caché.
Los registros siempre se guardan localmente.
