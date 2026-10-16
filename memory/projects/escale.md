# Proyecto Escale — Rediseño web + Agente IA

**Repositorio:** `chema9233/escale_per-`
**Rama de trabajo:** `claude/adoring-ritchie-iht6pu`
**Cliente:** Escale (escale.edu.pe) — Escuela de Alta Especialización, Lima, Perú
**Estado:** Conexión real activa (12-10-2026). Deploy automático a Easypanel.

## Qué se entregó

### 1. `index.html` — Home rediseñada
- Colores Escale: azul `#27336E`, dorado `#D9A423`
- Iconos Lucide (trazo fino), animaciones CSS (sin GIFs)
- Modo oscuro automático, respeta "reducir movimiento"
- Datos de escale.edu.pe a 28-09-2026 (cursos, mentores, precios, contacto)

### 2. `widget/escale-agente.js` — Agente IA embebible
5 formas de interacción desde cualquier punto de la página:
1. **Voz** → ElevenLabs (dentro del panel)
2. **Chat texto** → n8n (Chat Trigger + AI Agent)
3. **Ayúdame a elegir curso** → chat con 3 preguntas orientadoras
4. **Que me llame un asesor** → formulario → n8n → Airtable/WhatsApp
5. **WhatsApp** → `wa.me/51933097424` con mensaje preescrito

Extras: burbuja de saludo a los 8 s, atributo `data-escale-agente="voz|chat|form|wa"` en cualquier botón.

**Configuración mínima** (3 claves):
```js
window.ESCALE_AGENTE = {
  elevenlabsAgentId: "agent_1701m3m828zfegy8kd0atavyepva",
  n8nChatUrl: "https://TU-N8N/webhook/XXXX/chat",
  n8nLeadUrl: "https://TU-N8N/webhook/escale/lead"
};
```
En WordPress: plugin WPCode → HTML → Footer.
Parámetros de color: `colorPrincipal`, `colorAcento`, `colorWhatsapp`, `nombreAgente`.

### 3. `PROMPT_AGENTE_ESCALE.md` — Prompt de Sofía
Mismo prompt para voz (ElevenLabs) y texto (n8n).

## Infraestructura conectada (12-10-2026)

| Pieza | Identificador / URL | Notas |
|-------|---------------------|-------|
| Agente voz | `agent_1701m3m828zfegy8kd0atavyepva` | Herramienta `registrar_lead` → n8n |
| Agente llamadas salientes | `agent_0001m4rfgpybfn69bva1mn3cpj1p` | Solo pruebas manuales |
| Workflow chat | `Escale · Chat de Sofía (OpenRouter)` | DeepSeek vía OpenRouter, memoria por conversación |
| Workflow leads | `Escale · Leads de Sofía (widget, chat y voz)` | Endpoint: `/webhook/escale/lead` |
| Tabla leads | `escale_leads` (n8n) | |
| Email leads | `admisiones@escale.edu.pe` (Brevo) | |
| WhatsApp leads | `+51 933 097 424` (Evolution, instancia `bot whatsapp fluentia`) | |
| WhatsApp IA | n8n · `AGENTE WHATSAPP IA FLUENTIA` + subflujo `Escale · WhatsApp Sofía` | Número de prueba Meta `+1 555-661-5253` |
| Deploy | Easypanel · servicio `escale-web` | Webhook GitHub → auto-deploy en cada push a `main` |
| Subdominio demo | `escale.fluentia.marketing` | CORS configurado aquí y en `escale.edu.pe` |

**Payload del lead:** `nombre, telefono, email, interes, origen, pagina, fecha, sessionId`

## Cursos activos (a 28-09-2026, revisar mensualmente)

### Con inscripción abierta
| Curso | Mentor | Fechas | Horario | Precio |
|-------|--------|--------|---------|--------|
| CAE Gerencia de Marketing para Restaurantes | Fiorella Costa | 10-oct al 28-nov 2026 | Sáb 9-12h | S/ 1.980 |
| CAE Gerencia de Reputación Corporativa y Crisis | Daniel Suárez | 13-oct al 1-dic 2026 | Mar 19-22h | S/ 1.980 |
| CAE Neuro Branding | Carlos Dulanto | 15-oct al 3-dic 2026 | Jue 19-22h | S/ 1.980 |
| CAE Gerencia Estratégica de Compras | Carlos Cámero | 20-oct al 15-dic 2026 | Mar 19-22h | S/ 1.980 |

### En curso (ofrecer próxima edición)
- PAE Derecho para Alta Gerencia — Renzo Petrozzi — hasta 28-ene-2027 — S/ 6.500
- CAE Customer Experience — Deepak Nandwani — hasta 2-nov-2026
- CAE Dirección Comercial B2B — Álvaro Acuña Turati — hasta 20-oct-2026
- CAE Insights y Campañas Publicitarias — Carlos Dulanto — hasta 1-oct-2026

### Próximamente (sin fecha)
- CAE Gerencia de Marketing y Gestión Comercial — Carlos Palomino
- CAE Gerencia de Restaurantes — Waldo Meza

## Despliegue (Easypanel)
1. Easypanel → proyecto → **+ Servicio → App** (`escale-web`)
2. Origen GitHub → rama `main` → Dockerfile
3. Dominio: `escale.fluentia.marketing`, puerto 80, HTTPS
4. DNS: registro A apuntando al servidor
5. ElevenLabs → Security → añadir dominio a lista permitida

## Pendientes con Escale
- [ ] Confirmar colores exactos y logo en SVG
- [ ] Validar textos de privacidad con asesor legal (Ley N.° 29733)
- [ ] Certificadora ISO: ¿SGS, Bureau Veritas…? (no usar logo ISO directamente)
- [ ] Grabaciones de clases, formas de pago/cuotas/becas
- [ ] Duración real del PAE (web dice 24h pero dura 4 meses — posible error)
- [ ] Actualizar portadas cursos "en curso" (dicen "Inscripciones abiertas")
- [ ] Testimonios de alumnos (su web no publica ninguno)
- [ ] Captura del widget de fluentia.marketing (carga con JS, no se ve en lectura)

## Pendientes técnicos
- [ ] Conectar agente llamadas salientes (`agent_0001m4rfgpybfn69bva1mn3cpj1p`) al flujo de leads
- [ ] Activar OpenRouter como Custom LLM en voz (ElevenLabs → Workspace Secrets → Custom LLM)
- [ ] Cambiar WhatsApp demo (Meta `+1 555-661-5253`) por número real de Escale (+51 933 097 424)
- [ ] Validar que Escale (WordPress) pegue el snippet con WPCode en footer

## Notas de diseño
- Sin GIFs: animaciones CSS puras (scroll fade-in, contadores, barras, brillo dorado, cinta empresas)
- `prefers-reduced-motion`: web sin animaciones para quienes lo tienen activado
- Modo oscuro automático por media query
