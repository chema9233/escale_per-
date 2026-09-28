# Escale — Rediseño web + Agente IA (voz y texto)

Propuesta de rediseño de la home de https://escale.edu.pe/ con una asesora IA ("Sofía")
que el visitante puede usar de 5 formas desde cualquier punto de la página.

## Cómo verla en tu ordenador
1. En GitHub, botón verde **Code** → **Download ZIP**.
2. Descomprime el ZIP (clic derecho → *Extraer todo*).
3. Doble clic en `index.html`. Se abre en el navegador con el asistente en modo demo.

> Hace falta internet: el logo, las portadas de los cursos y los sellos ISO se cargan
> directamente desde escale.edu.pe. Si el logo no carga, aparece una versión redibujada en SVG.

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La home rediseñada. |
| `widget/escale-agente.js` | El agente IA en un solo archivo. Se puede pegar en **cualquier** web (también en la actual de Escale, sin rediseñarla). |
| `PROMPT_AGENTE_ESCALE.md` | Instrucciones de "Sofía" para ElevenLabs (voz) y n8n (texto), con los cursos reales. |

## De dónde salen los datos
Todo de **escale.edu.pe**, consultado el **28-09-2026**:
- Nombre, lema, pilares y textos de "Nosotros".
- Los 10 cursos y programas: mentor, fechas, horario, precio y enlace a su ficha.
- Portadas de los cursos y la imagen de sellos ISO (son archivos de su web).
- Contacto, redes sociales y enlaces legales.

Colores `#27336E` (azul) y `#D9A423` (dorado): medidos a ojo sobre su logo. **Confirmar con su manual de marca.**

## Diseño
- Iconos de trazo fino (estilo Lucide) en lugar de emojis.
- Animaciones ligeras hechas con código (sin GIF, que pesan mucho y se ven pixelados):
  aparición suave al hacer scroll, cifras que cuentan hacia arriba, barras del logo que "crecen"
  en la cabecera, brillo dorado en movimiento y cinta con las empresas donde han trabajado los mentores.
- Quien tenga activado "reducir movimiento" en su sistema ve la web sin animaciones.
- Modo oscuro automático.

## Las 5 opciones del agente
1. **Hablar por voz** → agente de ElevenLabs, dentro del propio panel.
2. **Escribir al asistente** → chat conectado a n8n (nodo *Chat Trigger* + *AI Agent*).
3. **Ayúdame a elegir curso** → abre el chat con 3 preguntas de orientación.
4. **Que me llame un asesor** → formulario corto que envía el lead a n8n (→ Airtable / WhatsApp).
5. **WhatsApp** → abre wa.me/51933097424 con un mensaje ya escrito.

Además: burbuja de saludo a los 8 segundos, y **cualquier botón de la web** puede abrir
una opción concreta añadiéndole `data-escale-agente="voz"` (o `chat`, `form`, `wa`).

Sin configurar nada, el widget funciona en **modo demo** (respuestas de ejemplo con datos reales).

## Cómo conectarlo de verdad (paso a paso)

### Paso 1 — Agente de voz (ElevenLabs)
1. En ElevenLabs → *Agents* → crear agente nuevo "Escale – Sofía".
2. Pegar el prompt de `PROMPT_AGENTE_ESCALE.md`, idioma español, voz latina neutra.
3. En *Security* dejar la autenticación desactivada (agente público) y añadir
   `escale.edu.pe` en la lista de dominios permitidos (así nadie más puede usarlo).
4. Copiar el **Agent ID** (empieza por `agent_…`).

### Paso 2 — Chat de texto (n8n)
1. Nuevo workflow: **Chat Trigger** (activar "Make Chat Publicly Available", modo *Embedded Chat*)
   → **AI Agent** (OpenRouter + memoria) con el mismo prompt.
2. En *Allowed Origins (CORS)* poner `https://escale.edu.pe`.
3. Activar el workflow y copiar la **URL del Chat Trigger**.

### Paso 3 — Leads del formulario (n8n)
1. Nuevo workflow: **Webhook** (POST, *Respond: Immediately*) → Airtable (crear registro) → aviso por WhatsApp al equipo.
2. Copiar la **URL de producción** del webhook.
3. Llega: `nombre, telefono, email, interes, origen, pagina, fecha, sessionId`.

### Paso 4 — Pegar las 3 claves
Al final de `index.html` (o en la web del cliente):

```html
<script>
  window.ESCALE_AGENTE = {
    elevenlabsAgentId: "agent_XXXX",
    n8nChatUrl: "https://TU-N8N/webhook/XXXX/chat",
    n8nLeadUrl: "https://TU-N8N/webhook/escale/lead"
  };
</script>
<script src="https://TU-DOMINIO/escale-agente.js" defer></script>
```

- **La web de Escale es WordPress**: plugin *WPCode* → "Añadir fragmento" → HTML → ubicación *Footer* → pegar lo de arriba.
- Colores y nombre del agente se cambian en esa misma configuración: `colorPrincipal`, `colorAcento`, `nombreAgente`.

## Pendiente de confirmar con Escale
- Colores exactos de marca y logo en SVG (ahora se usa el PNG de su web).
- Entidad que certificó sus normas ISO: si quieren mostrar el **sello oficial de la certificadora**
  (p. ej. el de SGS, Bureau Veritas…), tienen que enviarnos ellos el archivo y su manual de uso.
  El logo de la organización ISO no se puede usar (ISO lo prohíbe expresamente).
- Grabaciones de las clases, formas de pago, cuotas y becas.
- Duración real del PAE en horas (su web dice 24 h pero dura 4 meses: parece un error).
- Las portadas de los cursos "en curso" llevan el texto "Inscripciones abiertas" porque así
  están en su web; convendría actualizarlas.
- Testimonios reales de alumnos (su web no publica ninguno; por eso no hay sección de testimonios).
- Estilo del agente de fluentia.marketing: no se ha podido ver (se carga con JavaScript y la
  herramienta de lectura no lo ve). Pendiente de captura o de acceso al panel de ElevenLabs.
