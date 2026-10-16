# Memory — Proyecto Escale Perú

## Yo
José (Fluentia). Dirijo una agencia de automatización con IA para academias de oposiciones/formación.
Este repo es el diseño web + widget IA para **Escale** (cliente peruano).

## Proyecto
| Nombre | Qué es |
|--------|--------|
| **escale_per-** | Rediseño home + agente IA "Sofía" para escale.edu.pe |
| **Sofía** | Asesora IA de Escale (voz ElevenLabs + chat n8n) |
| **widget** | `widget/escale-agente.js` — se pega en cualquier web |

→ Detalles: memory/projects/escale.md

## Piezas técnicas clave
| Pieza | Dónde | Estado |
|-------|-------|--------|
| Chat texto (Sofía) | n8n · `Escale · Chat de Sofía (OpenRouter)` | Activo ✅ |
| Leads (widget+chat+voz) | n8n · `Escale · Leads de Sofía` → `/webhook/escale/lead` | Activo ✅ |
| Voz | ElevenLabs · `agent_1701m3m828zfegy8kd0atavyepva` | Activo ✅ |
| Llamadas salientes (prueba) | ElevenLabs · `agent_0001m4rfgpybfn69bva1mn3cpj1p` | Solo pruebas ⚠️ |
| WhatsApp IA | n8n · `AGENTE WHATSAPP IA FLUENTIA` + subflujo `Escale · WhatsApp Sofía` | Demo (nº prueba Meta) ⚠️ |

## Personas del proyecto
| Quién | Rol |
|-------|-----|
| **Escale** | Cliente — academia online peruana |
| **admisiones@escale.edu.pe** | Contacto de admisiones (recibe leads) |
| **+51 933 097 424** | WhatsApp Escale (también recibe avisos de leads) |

→ Perfiles: memory/people/

## Términos del proyecto
| Término | Significado |
|---------|-------------|
| **CAE** | Curso de Alta Especialización (24h, 8 sesiones, S/ 1.980) |
| **PAE** | Programa de Alta Especialización (varios meses, más largo) |
| **Sofía** | Nombre de la asesora IA de Escale |
| **widget** | `escale-agente.js` — el chat/voz/formulario embebido |
| **leads** | Contactos captados (nombre + WhatsApp + interés) |
| **registrar_lead** | Herramienta del agente que envía el contacto a n8n |
| **Easypanel** | Plataforma donde se despliega la web (contenedor Docker) |
| **escale.fluentia.marketing** | Subdominio de demo/producción del rediseño |
| **Evolution** | Instancia WhatsApp de Fluentia usada para avisos (`bot whatsapp fluentia`) |
| **OpenRouter** | Proveedor LLM usado en n8n (modelo DeepSeek) |

→ Glosario completo: memory/glossary.md

## Colores de marca (pendiente confirmar con Escale)
- Azul: `#27336E`
- Dorado: `#D9A423`

## Pendientes con Escale
- Confirmar colores exactos y logo SVG
- Validar textos de privacidad (Ley N.° 29733)
- Activar OpenRouter como Custom LLM en ElevenLabs (voz)
- Conectar agente de llamadas salientes al flujo de leads
- Cambiar WhatsApp demo (Meta) por número real de Escale

→ Ver memory/projects/escale.md para pendientes completos
