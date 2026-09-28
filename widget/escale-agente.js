/*!
 * Escale — Widget de Agente IA (voz + texto + WhatsApp + asesoría)
 * ---------------------------------------------------------------
 * Un solo archivo. Se pega en cualquier web (HTML, WordPress, Elementor…):
 *
 *   <script>
 *     window.ESCALE_AGENTE = { elevenlabsAgentId: "...", n8nChatUrl: "...", ... };
 *   </script>
 *   <script src="escale-agente.js" defer></script>
 *
 * Es un script normal (no "module") para que también funcione abriendo el HTML con doble clic.
 * Si no rellenas la configuración, el widget funciona en MODO DEMO
 * (respuestas de ejemplo con datos reales de escale.edu.pe) para poder enseñarlo al cliente.
 */
(function () {
  "use strict";

  const DEFAULTS = {
    marca: "Escale",
    nombreAgente: "Sofía",                 // nombre del asistente (validar con el cliente)
    colorPrincipal: "#27336E",             // azul del logo de Escale (medido a ojo: confirmar con su manual de marca)
    colorAcento: "#D9A423",                // dorado del logo de Escale (ídem)
    colorTextoAcento: "#1C2555",           // texto sobre el dorado (el blanco no se lee bien)
    // --- Voz (ElevenLabs Agents) ---
    elevenlabsAgentId: "",                 // p.ej. "agent_01abc..." (agente PÚBLICO)
    // --- Texto (n8n: nodo "Chat Trigger", modo público) ---
    n8nChatUrl: "",                        // p.ej. "https://TU-N8N/webhook/xxxx/chat"
    // --- Formulario de asesoría (n8n: nodo "Webhook" POST) ---
    n8nLeadUrl: "",                        // p.ej. "https://TU-N8N/webhook/escale/lead"
    // --- WhatsApp ---
    whatsapp: "51933097424",               // verificado en escale.edu.pe (sep-2026)
    mensajeWhatsapp: "Hola, vengo de la web de Escale y quiero información sobre sus cursos.",
    // --- Comportamiento ---
    saludoProactivoSegundos: 8,            // 0 = desactivado
    saludoProactivo: "¿Te ayudo a elegir tu curso?",
  };

  const CFG = Object.assign({}, DEFAULTS, window.ESCALE_AGENTE || {});
  const DEMO_TEXTO = !CFG.n8nChatUrl;
  const DEMO_VOZ = !CFG.elevenlabsAgentId;

  /* ---------------------------------------------------------------- iconos (trazo fino, estilo Lucide) */
  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    chat: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    mic: svg('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>'),
    target: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
    phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
    wa: svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
  };

  /* ---------------------------------------------------------------- estilos */
  const css = `
.esc-root{--esc-p:${CFG.colorPrincipal};--esc-a:${CFG.colorAcento};--esc-on-a:${CFG.colorTextoAcento};--esc-bg:#fff;--esc-tx:#1a1f36;--esc-mut:#667085;--esc-br:#e4e7ec;--esc-soft:#f4f5fa;
  position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--esc-tx)}
@media (prefers-color-scheme:dark){.esc-root{--esc-bg:#141a33;--esc-tx:#eef1f8;--esc-mut:#9aa3b8;--esc-br:#283052;--esc-soft:#1c2440}}
.esc-root *{box-sizing:border-box}
.esc-root svg{width:20px;height:20px;flex:none}
.esc-fab{width:62px;height:62px;border-radius:50%;border:0;cursor:pointer;background:var(--esc-p);color:#fff;
  box-shadow:0 10px 30px rgba(20,30,80,.35);display:grid;place-items:center;transition:transform .2s}
.esc-fab:hover{transform:scale(1.06)}
.esc-fab svg{width:26px;height:26px}
.esc-fab::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--esc-a);animation:escPulse 2.4s infinite;pointer-events:none}
.esc-root.open .esc-fab::after{display:none}
@keyframes escPulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.5);opacity:0}}
.esc-bubble{position:absolute;right:74px;bottom:12px;background:var(--esc-bg);color:var(--esc-tx);border:1px solid var(--esc-br);
  padding:10px 14px;border-radius:14px 14px 4px 14px;box-shadow:0 8px 24px rgba(0,0,0,.12);white-space:nowrap;font-size:14px;font-weight:500;cursor:pointer;
  opacity:0;transform:translateY(6px);transition:.3s;pointer-events:none}
.esc-bubble.show{opacity:1;transform:none;pointer-events:auto}
.esc-panel{position:absolute;right:0;bottom:78px;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);
  background:var(--esc-bg);border:1px solid var(--esc-br);border-radius:18px;box-shadow:0 24px 60px rgba(10,20,60,.28);
  display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;transition:.25s}
.esc-root.open .esc-panel{opacity:1;transform:none;pointer-events:auto}
@media (max-width:480px){.esc-root{right:16px;bottom:16px}.esc-panel{position:fixed;inset:auto 0 0 0;width:100%;max-width:100%;height:88vh;max-height:88vh;border-radius:18px 18px 0 0}.esc-root.open .esc-fab,.esc-root.open .esc-bubble{display:none}}
.esc-head{background:var(--esc-p);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}
.esc-av{width:40px;height:40px;border-radius:50%;background:var(--esc-a);color:var(--esc-on-a);display:grid;place-items:center;font-weight:700}
.esc-head b{display:block;font-size:15px}.esc-head small{opacity:.85;font-size:12px}
.esc-head .esc-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#3ddc84;margin-right:6px}
.esc-x,.esc-back{margin-left:auto;background:transparent;border:0;color:#fff;cursor:pointer;font-size:22px;line-height:1;padding:4px 6px;border-radius:8px}
.esc-back{margin-left:0;font-size:18px;display:none}.esc-root.in-view .esc-back{display:block}
.esc-body{flex:1;overflow:auto;padding:16px}
.esc-view{display:none;height:100%}.esc-view.active{display:flex;flex-direction:column}
.esc-intro{font-size:14px;color:var(--esc-mut);margin:0 0 14px;line-height:1.5}
.esc-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;margin-bottom:10px;border:1px solid var(--esc-br);
  border-radius:12px;background:var(--esc-soft);color:var(--esc-tx);cursor:pointer;font:inherit;transition:.15s}
.esc-opt:hover{border-color:var(--esc-a);transform:translateX(2px)}
.esc-opt .i{width:36px;height:36px;border-radius:10px;background:var(--esc-p);color:#fff;display:grid;place-items:center;flex:none}
.esc-opt .i svg{width:18px;height:18px}
.esc-opt b{display:block;font-size:14px}.esc-opt span{font-size:12.5px;color:var(--esc-mut)}
.esc-msgs{flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px;padding-bottom:8px}
.esc-m{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}
.esc-m.bot{background:var(--esc-soft);align-self:flex-start;border-bottom-left-radius:4px}
.esc-m.user{background:var(--esc-p);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.esc-typing{align-self:flex-start;color:var(--esc-mut);font-size:13px}
.esc-chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}
.esc-chip{border:1px solid var(--esc-br);background:var(--esc-bg);color:var(--esc-tx);border-radius:999px;padding:6px 11px;font-size:12.5px;cursor:pointer;font-family:inherit}
.esc-chip:hover{border-color:var(--esc-a)}
.esc-input{display:flex;gap:8px;border-top:1px solid var(--esc-br);padding-top:10px}
.esc-input input{flex:1;border:1px solid var(--esc-br);background:var(--esc-bg);color:var(--esc-tx);border-radius:12px;padding:11px 12px;font:inherit;font-size:14px}
.esc-input button,.esc-btn{border:0;background:var(--esc-a);color:var(--esc-on-a);border-radius:12px;padding:0 16px;cursor:pointer;font:inherit;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px}
.esc-voice{align-items:center;justify-content:center;text-align:center;gap:16px}
.esc-orb{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--esc-a),var(--esc-p));
  box-shadow:0 0 0 0 color-mix(in srgb,var(--esc-a) 45%,transparent);transition:transform .2s}
.esc-orb.listening{animation:escOrb 1.6s infinite}.esc-orb.speaking{animation:escOrb .7s infinite;transform:scale(1.05)}
@keyframes escOrb{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--esc-a) 45%,transparent)}100%{box-shadow:0 0 0 28px transparent}}
.esc-vstatus{font-size:14px;color:var(--esc-mut);min-height:20px}
.esc-vlast{font-size:13px;color:var(--esc-tx);max-width:290px;min-height:40px}
.esc-btn{padding:12px 22px}.esc-btn.stop{background:#e5484d;color:#fff}
.esc-form label{display:block;font-size:13px;margin:10px 0 4px;color:var(--esc-mut)}
.esc-form input,.esc-form select{width:100%;border:1px solid var(--esc-br);background:var(--esc-bg);color:var(--esc-tx);border-radius:10px;padding:10px 12px;font:inherit;font-size:14px}
.esc-form .esc-btn{width:100%;margin-top:16px;padding:13px}
.esc-ok{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.5}
.esc-ok svg{color:#12a150;margin-top:2px}
.esc-legal{font-size:11px;color:var(--esc-mut);margin-top:8px;line-height:1.4}
.esc-foot{text-align:center;font-size:11px;color:var(--esc-mut);padding:6px 0 10px}
.esc-demo{font-size:11px;background:#fff4e5;color:#8a4b00;border-radius:8px;padding:6px 9px;margin-bottom:10px}
`;

  /* ---------------------------------------------------------------- HTML */
  const inicial = CFG.nombreAgente.charAt(0).toUpperCase();
  const root = document.createElement("div");
  root.className = "esc-root";
  root.innerHTML = `
<style>${css}</style>
<div class="esc-bubble" role="button">${CFG.saludoProactivo}</div>
<div class="esc-panel" role="dialog" aria-label="Asistente de ${CFG.marca}">
  <div class="esc-head">
    <button class="esc-back" aria-label="Volver">←</button>
    <div class="esc-av">${inicial}</div>
    <div><b>${CFG.nombreAgente} · ${CFG.marca}</b><small><span class="esc-dot"></span>Asesora académica IA · responde al instante</small></div>
    <button class="esc-x" aria-label="Cerrar">×</button>
  </div>
  <div class="esc-body">
    <!-- MENÚ -->
    <div class="esc-view active" data-view="menu">
      <p class="esc-intro">Hola, soy ${CFG.nombreAgente}, de ${CFG.marca}. ¿Cómo prefieres que te ayude?</p>
      <button class="esc-opt" data-go="voz"><span class="i">${IC.mic}</span><div><b>Hablar por voz</b><span>Conversa conmigo como en una llamada</span></div></button>
      <button class="esc-opt" data-go="chat"><span class="i">${IC.chat}</span><div><b>Escribir al asistente</b><span>Resuelve tus dudas por chat</span></div></button>
      <button class="esc-opt" data-go="chat" data-prompt="Quiero que me ayudes a elegir el programa ideal para mí."><span class="i">${IC.target}</span><div><b>Ayúdame a elegir curso</b><span>3 preguntas y te recomiendo uno</span></div></button>
      <button class="esc-opt" data-go="form"><span class="i">${IC.phone}</span><div><b>Quiero que me llame un asesor</b><span>Déjanos tus datos y te contactamos</span></div></button>
      <button class="esc-opt" data-go="wa"><span class="i">${IC.wa}</span><div><b>Ir a WhatsApp</b><span>Habla con el equipo de admisiones</span></div></button>
    </div>
    <!-- CHAT -->
    <div class="esc-view" data-view="chat">
      ${DEMO_TEXTO ? '<div class="esc-demo">Modo demo: conecta tu webhook de n8n en <code>n8nChatUrl</code>.</div>' : ""}
      <div class="esc-msgs"></div>
      <div class="esc-chips">
        <button class="esc-chip">¿Qué cursos empiezan pronto?</button>
        <button class="esc-chip">¿Cuánto dura un curso?</button>
        <button class="esc-chip">¿Es online?</button>
        <button class="esc-chip">¿Dan certificado?</button>
      </div>
      <form class="esc-input"><input type="text" placeholder="Escribe tu pregunta…" aria-label="Mensaje" required><button type="submit">Enviar</button></form>
    </div>
    <!-- VOZ -->
    <div class="esc-view esc-voice" data-view="voz">
      ${DEMO_VOZ ? '<div class="esc-demo">Modo demo: pon el ID de tu agente de ElevenLabs en <code>elevenlabsAgentId</code>.</div>' : ""}
      <div class="esc-orb"></div>
      <div class="esc-vstatus">Pulsa para empezar a hablar. Te pediremos permiso para usar el micrófono.</div>
      <div class="esc-vlast"></div>
      <button class="esc-btn esc-vbtn">${IC.mic}<span>Empezar conversación</span></button>
    </div>
    <!-- FORM -->
    <div class="esc-view" data-view="form">
      <form class="esc-form">
        <p class="esc-intro">Déjanos tus datos y un asesor de admisiones te contacta hoy mismo.</p>
        <label>Nombre</label><input name="nombre" required autocomplete="name">
        <label>WhatsApp</label><input name="telefono" type="tel" required placeholder="+51 9xx xxx xxx" autocomplete="tel">
        <label>Correo</label><input name="email" type="email" autocomplete="email">
        <label>¿Qué te interesa?</label>
        <select name="interes"><option>Aún no lo sé, quiero orientación</option><option>Un curso concreto</option><option>Formas de pago</option><option>Avisarme de próximas ediciones</option></select>
        <label style="display:flex;gap:8px;align-items:flex-start;color:var(--esc-mut)"><input type="checkbox" name="acepto" required style="width:auto;margin-top:3px">Acepto ser contactado y la política de privacidad.</label>
        <button class="esc-btn" type="submit">Quiero que me llamen</button>
        <p class="esc-legal">Tus datos se usan solo para informarte sobre ${CFG.marca}.</p>
      </form>
    </div>
  </div>
  <div class="esc-foot">Asistente con IA · puede cometer errores</div>
</div>
<button class="esc-fab" aria-label="Abrir asistente de ${CFG.marca}">${IC.chat}</button>`;
  document.body.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const $$ = (s) => root.querySelectorAll(s);

  /* ---------------------------------------------------------------- navegación */
  function abrir() { root.classList.add("open"); $(".esc-bubble").classList.remove("show"); }
  function cerrar() { root.classList.remove("open"); pararVoz(); }
  function ir(vista) {
    $$(".esc-view").forEach((v) => v.classList.toggle("active", v.dataset.view === vista));
    root.classList.toggle("in-view", vista !== "menu");
    track("esc_opcion", { opcion: vista });
  }
  function abrirWhatsapp() {
    window.open(`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(CFG.mensajeWhatsapp)}`, "_blank", "noopener");
    track("esc_opcion", { opcion: "whatsapp" });
  }
  $(".esc-fab").onclick = () => (root.classList.contains("open") ? cerrar() : abrir());
  $(".esc-x").onclick = cerrar;
  $(".esc-bubble").onclick = abrir;
  $(".esc-back").onclick = () => { pararVoz(); ir("menu"); };
  $$(".esc-opt").forEach((b) => (b.onclick = () => {
    const go = b.dataset.go;
    if (go === "wa") return abrirWhatsapp();
    ir(go);
    if (go === "chat") iniciarChat(b.dataset.prompt);
  }));

  // Cualquier elemento de la página con data-escale-agente="voz|chat|form|wa" abre el widget en esa opción
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-escale-agente]");
    if (!a) return;
    e.preventDefault();
    const v = a.dataset.escaleAgente;
    if (v === "wa") return abrirWhatsapp();
    abrir();
    ir(v);
    if (v === "chat") iniciarChat(a.dataset.prompt);
  });

  if (CFG.saludoProactivoSegundos > 0) {
    setTimeout(() => { if (!root.classList.contains("open")) $(".esc-bubble").classList.add("show"); }, CFG.saludoProactivoSegundos * 1000);
  }

  /* ---------------------------------------------------------------- CHAT (n8n) */
  const sessionId = (() => {
    try { let s = localStorage.getItem("esc_sid"); if (!s) { s = crypto.randomUUID(); localStorage.setItem("esc_sid", s); } return s; }
    catch (e) { return "s-" + Math.random().toString(36).slice(2); }
  })();
  let chatIniciado = false;

  function pintar(txt, quien) {
    const d = document.createElement("div");
    d.className = "esc-m " + quien;
    d.textContent = txt;
    $(".esc-msgs").appendChild(d);
    $(".esc-msgs").scrollTop = 1e9;
    return d;
  }
  function iniciarChat(promptInicial) {
    if (!chatIniciado) {
      chatIniciado = true;
      pintar(`Hola, soy ${CFG.nombreAgente}. Cuéntame qué te gustaría conseguir en tu carrera y te recomiendo el curso que mejor encaja.`, "bot");
    }
    if (promptInicial) enviar(promptInicial);
    setTimeout(() => $(".esc-input input").focus(), 50);
  }
  async function enviar(texto) {
    pintar(texto, "user");
    $(".esc-chips").style.display = "none";
    const t = document.createElement("div");
    t.className = "esc-typing"; t.textContent = `${CFG.nombreAgente} está escribiendo…`;
    $(".esc-msgs").appendChild(t);
    let respuesta;
    try {
      if (DEMO_TEXTO) {
        await new Promise((r) => setTimeout(r, 900));
        respuesta = respuestaDemo(texto);
      } else {
        // Formato del nodo "Chat Trigger" de n8n (modo público / webhook)
        const r = await fetch(CFG.n8nChatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sendMessage", sessionId, chatInput: texto, metadata: { pagina: location.href } }),
        });
        const data = await r.json();
        const d0 = Array.isArray(data) ? data[0] : data;
        respuesta = (d0 && d0.output) || "Perdona, no he podido responder. ¿Lo intentas de nuevo?";
      }
    } catch (e) {
      respuesta = "Ahora mismo tengo un problema de conexión. Si quieres, escríbenos por WhatsApp y te atendemos enseguida.";
    }
    t.remove();
    pintar(respuesta, "bot");
    track("esc_chat_mensaje");
  }
  $(".esc-input").onsubmit = (e) => {
    e.preventDefault();
    const i = $(".esc-input input");
    const v = i.value.trim(); if (!v) return;
    i.value = ""; enviar(v);
  };
  $$(".esc-chip").forEach((c) => (c.onclick = () => enviar(c.textContent)));

  // Respuestas de ejemplo con datos reales de escale.edu.pe (28-09-2026). En producción responde el agente de n8n.
  function respuestaDemo(t) {
    t = t.toLowerCase();
    if (t.includes("elegir") || t.includes("recomiend")) return "Perfecto. Para recomendarte bien, 3 preguntas rápidas:\n1) ¿Cuál es tu cargo y en qué sector trabajas?\n2) ¿Qué quieres conseguir (ascender, liderar un área, emprender)?\n3) ¿Te viene mejor entre semana por la noche o sábado por la mañana?";
    if (t.includes("pronto") || t.includes("empiez") || t.includes("inicio") || t.includes("curso") || t.includes("programa")) return "Estos empiezan en octubre:\n• Marketing para Restaurantes – 10 oct (sáb.)\n• Reputación Corporativa y Crisis – 13 oct (mar.)\n• Neuro Branding – 15 oct (jue.)\n• Compras y Abastecimiento – 20 oct (mar.)\n¿Cuál te llama más la atención?";
    if (t.includes("online") || t.includes("digital") || t.includes("presencial")) return "Sí, todas las clases son online en vivo: te conectas con tu mentor y tus compañeros en el horario del curso.";
    if (t.includes("dura") || t.includes("tiempo") || t.includes("horas")) return "Cada Curso de Alta Especialización (CAE) son 24 horas académicas en 8 sesiones de 3 horas, una por semana.";
    if (t.includes("certific")) return "Sí. Al completar las horas académicas recibes un certificado emitido por Escale, que tiene certificación ISO 21001 como organización educativa.";
    if (t.includes("precio") || t.includes("cuesta") || t.includes("pago") || t.includes("inversi")) return "Un Curso de Alta Especialización tiene una inversión de S/ 1,980. Las formas de pago te las detalla un asesor de admisiones. ¿Quieres que te escriba hoy?";
    return "Buena pregunta. En la versión real te respondo con toda la información de Escale. ¿Quieres que un asesor de admisiones te contacte?";
  }

  /* ---------------------------------------------------------------- VOZ (ElevenLabs) */
  let conv = null;
  const orb = $(".esc-orb"), vst = $(".esc-vstatus"), vlast = $(".esc-vlast"), vbtn = $(".esc-vbtn");
  const vbtnTxt = (icono, texto) => { vbtn.innerHTML = `${icono}<span>${texto}</span>`; };

  async function empezarVoz() {
    if (DEMO_VOZ) {
      vst.textContent = "Modo demo: aquí se conectará tu agente de voz de ElevenLabs.";
      orb.className = "esc-orb speaking";
      setTimeout(() => (orb.className = "esc-orb"), 2500);
      return;
    }
    vbtn.disabled = true;
    vst.textContent = "Conectando…";
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { Conversation } = await import("https://cdn.jsdelivr.net/npm/@elevenlabs/client@1/+esm");
      conv = await Conversation.startSession({
        agentId: CFG.elevenlabsAgentId,
        connectionType: "webrtc",
        onConnect: () => { vst.textContent = "Te escucho… habla cuando quieras."; orb.className = "esc-orb listening"; vbtnTxt(IC.stop, "Terminar"); vbtn.classList.add("stop"); vbtn.disabled = false; track("esc_voz_inicio"); },
        onDisconnect: () => resetVoz("Conversación terminada. ¡Gracias!"),
        onError: () => resetVoz("No se pudo conectar. Prueba de nuevo o usa el chat."),
        onModeChange: ({ mode }) => { orb.className = "esc-orb " + (mode === "speaking" ? "speaking" : "listening"); vst.textContent = mode === "speaking" ? `${CFG.nombreAgente} está hablando…` : "Te escucho…"; },
        onMessage: (m) => { if ((m.role || m.source) !== "user") vlast.textContent = m.message; },
      });
    } catch (e) {
      resetVoz(e && e.name === "NotAllowedError" ? "Necesito permiso de micrófono para hablar contigo." : "No se pudo iniciar la voz. Prueba con el chat.");
    }
  }
  function resetVoz(msg) {
    conv = null; orb.className = "esc-orb"; vbtn.disabled = false;
    vbtnTxt(IC.mic, "Empezar conversación"); vbtn.classList.remove("stop");
    if (msg) vst.textContent = msg;
  }
  async function pararVoz() { if (conv) { const c = conv; conv = null; try { await c.endSession(); } catch (e) {} resetVoz(); } }
  vbtn.onclick = () => (conv ? pararVoz() : empezarVoz());

  /* ---------------------------------------------------------------- FORMULARIO (lead) */
  $(".esc-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const datos = Object.fromEntries(new FormData(f));
    datos.origen = "widget-web"; datos.pagina = location.href; datos.fecha = new Date().toISOString(); datos.sessionId = sessionId;
    const btn = f.querySelector(".esc-btn"); btn.disabled = true; btn.textContent = "Enviando…";
    try {
      if (CFG.n8nLeadUrl) {
        const r = await fetch(CFG.n8nLeadUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
        if (!r.ok) throw new Error(r.status);
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      const ok = document.createElement("p");
      ok.className = "esc-ok";
      ok.innerHTML = IC.check + "<span></span>";
      ok.querySelector("span").textContent = `Listo, ${datos.nombre.split(" ")[0]}. Un asesor de admisiones te escribirá por WhatsApp muy pronto.`;
      f.replaceChildren(ok);
      track("esc_lead", { interes: datos.interes });
    } catch (err) {
      btn.disabled = false; btn.textContent = "Quiero que me llamen";
      alert("No se pudo enviar. Escríbenos por WhatsApp y te atendemos.");
    }
  };

  /* ---------------------------------------------------------------- analítica */
  function track(evento, params) {
    params = params || {};
    try { if (window.gtag) window.gtag("event", evento, params); if (window.dataLayer) window.dataLayer.push(Object.assign({ event: evento }, params)); } catch (e) {}
  }
})();
