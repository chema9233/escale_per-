# Glosario — Proyecto Escale Perú

## Términos del negocio Escale
| Término | Significado | Contexto |
|---------|-------------|----------|
| CAE | Curso de Alta Especialización | 24h académicas, 8 sesiones online en vivo, certif. Escale, S/ 1.980 |
| PAE | Programa de Alta Especialización | Varios meses, más profundo que un CAE |
| Sofía | Asesora IA de Escale | Nombre del agente (voz + texto) |
| mentor | Profesional con trayectoria real que imparte el curso | El argumento de venta principal |
| admisiones | Equipo de ventas/atención de Escale | admisiones@escale.edu.pe |
| S/ | Soles peruanos (PEN) | Moneda del precio de los cursos |

## Términos técnicos del proyecto
| Término | Significado | Contexto |
|---------|-------------|----------|
| widget | `widget/escale-agente.js` | Archivo JS embebible en cualquier web |
| registrar_lead | Herramienta del agente IA | Envía contacto a n8n → Airtable + WhatsApp |
| lead / leads | Contacto captado (nombre + WhatsApp + interés) | Se guardan en tabla `escale_leads` de n8n |
| payload del lead | Campos que envía el widget | nombre, telefono, email, interes, origen, pagina, fecha, sessionId |
| escale_leads | Tabla de n8n donde se guardan los contactos | |
| Easypanel | Plataforma de deploy (contenedor Docker/Nginx) | Auto-deploy con webhook GitHub |
| escale.fluentia.marketing | Subdominio demo del rediseño | Dominio permitido en CORS y ElevenLabs |
| CORS | Restricción de origen cruzado | Flujos n8n solo aceptan llamadas desde dominios permitidos |
| Evolution | Instancia WhatsApp de Fluentia | `bot whatsapp fluentia` — envía avisos al equipo Escale |
| OpenRouter | Proxy de modelos LLM | Usado en n8n con DeepSeek para el chat de Sofía |
| DeepSeek | Modelo LLM (vía OpenRouter) | `deepseek/deepseek-v4-flash-0731` en n8n |
| Custom LLM | Configuración de ElevenLabs | Permite usar OpenRouter en el agente de voz (pendiente) |
| WPCode | Plugin WordPress | Para pegar el snippet del widget en el footer de escale.edu.pe |
| end_call | Herramienta de sistema ElevenLabs | Cuelga la llamada cuando la conversación termina |
| agent_17... | `agent_1701m3m828zfegy8kd0atavyepva` | ID del agente de voz Sofía en ElevenLabs |
| agent_00... | `agent_0001m4rfgpybfn69bva1mn3cpj1p` | ID del agente de llamadas salientes (solo pruebas) |
| Brevo | Plataforma de email | Envía notificación de lead a admisiones@escale.edu.pe |
| Lucide | Librería de iconos SVG de trazo fino | Estilo visual del rediseño |

## Normas y entidades
| Término | Significado |
|---------|-------------|
| ISO 9001:2015 | Certificación calidad — tiene Escale |
| ISO 21001:2018 | Certificación organizaciones educativas — tiene Escale |
| ISO 37001:2016 | Certificación antisoborno — tiene Escale |
| Ley N.° 29733 | Ley peruana de protección de datos personales |
| ARCO | Acceso, Rectificación, Cancelación y Oposición (derechos de datos) |

## Mentores de Escale
| Mentor | Curso | Trayectoria |
|--------|-------|-------------|
| Fiorella Costa | CAE Marketing Restaurantes | +20 años marketing: Burger King, Pizza Hut, Starbucks, Dunkin' |
| Daniel Suárez | CAE Reputación Corporativa | +25 años asuntos corporativos: Nestlé, PepsiCo, Coca-Cola, Ecopetrol |
| Carlos Dulanto | CAE Neuro Branding / CAE Insights | Autor 6 libros, fundador Gen Quijote, ex Head Planner Ogilvy, EFFIE de Oro |
| Carlos Cámero | CAE Compras y Abastecimiento | Economista, +40 años cadena suministro: SIDERPERU, British American Tobacco |
| Renzo Petrozzi | PAE Derecho Alta Gerencia | +20 años áreas legales: Nestlé, Mondelez, Linde |
| Deepak Nandwani | CAE Customer Experience | +20 años CX y transformación digital |
| Álvaro Acuña Turati | CAE Dirección Comercial B2B | +20 años venta B2B: minería, oil & gas, facility management |
| Carlos Palomino | CAE Marketing y Gestión Comercial | Próximamente |
| Waldo Meza | CAE Gerencia Restaurantes | Próximamente |
