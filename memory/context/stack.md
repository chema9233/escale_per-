# Stack técnico — Proyecto Escale Perú

## Frontend
| Tecnología | Uso |
|------------|-----|
| HTML/CSS/JS puro | `index.html` — home rediseñada |
| Lucide Icons | Iconos SVG de trazo fino |
| CSS animations | Scroll fade-in, contadores, barras, brillo dorado, cinta empresas |
| `prefers-reduced-motion` | Sin animaciones para quienes lo tienen activado |
| Modo oscuro | Automático vía media query |

## Widget (`widget/escale-agente.js`)
| Tecnología | Uso |
|------------|-----|
| JS vanilla | Sin dependencias externas |
| ElevenLabs Conversational AI SDK | Llamadas de voz en el navegador |
| n8n Chat Trigger API | Chat texto embebido |
| `window.ESCALE_AGENTE` | Config global (3 claves: elevenlabsAgentId, n8nChatUrl, n8nLeadUrl) |
| `data-escale-agente` attr | Cualquier botón puede abrir voz/chat/form/wa |

## Backend / Automatización
| Herramienta | Rol |
|-------------|-----|
| **n8n** | Automatización: chat, leads, WhatsApp IA |
| OpenRouter | Proxy LLM para n8n (modelo DeepSeek) |
| **ElevenLabs** | Agente de voz (Sofía) + agente llamadas salientes |
| **Brevo** | Email transaccional (avisos de leads) |
| **Evolution API** | WhatsApp (instancia `bot whatsapp fluentia`) |
| Airtable | CRM destino de leads (mencionado en docs, no confirmado activo) |

## Infraestructura
| Herramienta | Rol |
|-------------|-----|
| **Easypanel** | Plataforma de deploy (Docker + Nginx) |
| **Dockerfile + nginx.conf** | Contenedor del repo |
| GitHub webhook | Activa deploy automático en cada push a `main` |
| DNS registro A | Apunta subdominio al servidor de Easypanel |

## Integraciones del cliente (Escale)
| Sistema | Detalle |
|---------|----------|
| WordPress | Web actual de escale.edu.pe — el widget se pega con WPCode |
| Meta WhatsApp Business | Número real: +51 933 097 424 (en prod) |
| Meta WhatsApp prueba | +1 555-661-5253 (demo actual) |
