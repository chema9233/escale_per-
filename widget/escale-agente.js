/*!
 * Escale — Widget de Agente IA (voz + texto + asesoría)
 * ---------------------------------------------------------------
 * Un solo archivo. Se pega en cualquier web (HTML, WordPress, Elementor…):
 *
 *   <script>
 *     window.ESCALE_AGENTE = { elevenlabsAgentId: "...", n8nChatUrl: "...", ... };
 *   </script>
 *   <script src="escale-agente.js" defer></script>
 *
 * Si no rellenas la configuración, el widget funciona en MODO DEMO.
 */
(function () {
  "use strict";

  const DEFAULTS = {
    marca: "Escale",
    nombreAgente: "Sofía",
    colorPrincipal: "#27336E",
    colorPrincipalOscuro: "#1C2555",
    colorAcento: "#D9A423",
    colorAcentoOscuro: "#B8860B",
    colorTextoAcento: "#1C2555",
    // --- Voz (ElevenLabs Agents) ---
    elevenlabsAgentId: "",
    // --- Texto (n8n: nodo "Chat Trigger", modo público) ---
    n8nChatUrl: "",
    // --- Formulario de asesoría (n8n: nodo "Webhook" POST) ---
    n8nLeadUrl: "",
    // --- WhatsApp (solo se usa si otro elemento tiene data-escale-agente="wa") ---
    whatsapp: "51933097424",
    mensajeWhatsapp: "Hola, vengo de la web de Escale y quiero información sobre sus cursos.",
    // --- Comportamiento ---
    saludoProactivoSegundos: 8,
    saludoProactivo: "¿Te ayudo a elegir tu programa?",
  };

  const CFG = Object.assign({}, DEFAULTS, window.ESCALE_AGENTE || {});
  const DEMO_TEXTO = !CFG.n8nChatUrl;
  const DEMO_VOZ = !CFG.elevenlabsAgentId;

  /* ---------------------------------------------------------------- iconos SVG */
  const svg = (d) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    compass: svg('<circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-5.4 2.7-2.7 5.4 5.4-2.7z"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>'),
    mic:     svg('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3M9 22h6"/>'),
    phone:   svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 7.18 3.4 2 2 0 0 1 9.17 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L13.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14 3h3M17 3v3" stroke-width="1.5"/>'),
    chat:    svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    wa:      svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
    check:   svg('<path d="M20 6 9 17l-5-5"/>'),
    stop:    svg('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
    arrow:   svg('<path d="M5 12h14M12 5l7 7-7 7"/>'),
  };

  /* ---------------------------------------------------------------- Avatar SVG cara Sofía */
  const AVATAR_SVG = `<svg viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="23" cy="23" r="23" fill="#2a1f3d"/>
    <path d="M8 22C8 12.06 14.94 5 23 5s15 7.06 15 17" fill="#1a1040"/>
    <path d="M8 22c0 2 .5 5 2 7C8.5 30 8 26 8 22z" fill="#1a1040"/>
    <path d="M38 22c0 2-.5 5-2 7 1.5-1 2-5 2-7z" fill="#1a1040"/>
    <rect x="19.5" y="34" width="7" height="6" rx="3" fill="#c8967a"/>
    <ellipse cx="23" cy="25" rx="10" ry="11.5" fill="#d4a082"/>
    <ellipse cx="23" cy="34" rx="6.5" ry="3" fill="#c0896a" opacity=".45"/>
    <path d="M16.5 19.5 Q18.5 18.2 20.5 19.2" stroke="#4a2e1e" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    <path d="M25.5 19.2 Q27.5 18.2 29.5 19.5" stroke="#4a2e1e" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    <ellipse cx="19.5" cy="21.5" rx="2.4" ry="2" fill="white"/>
    <ellipse cx="26.5" cy="21.5" rx="2.4" ry="2" fill="white"/>
    <circle cx="19.8" cy="21.8" r="1.4" fill="#2c1a0e"/>
    <circle cx="26.8" cy="21.8" r="1.4" fill="#2c1a0e"/>
    <circle cx="20.2" cy="21.2" r=".5" fill="white"/>
    <circle cx="27.2" cy="21.2" r=".5" fill="white"/>
    <path d="M17.2 19.8 Q19.5 18.8 21.8 19.8" stroke="#2c1a0e" stroke-width=".9" stroke-linecap="round" fill="none"/>
    <path d="M24.2 19.8 Q26.5 18.8 28.8 19.8" stroke="#2c1a0e" stroke-width=".9" stroke-linecap="round" fill="none"/>
    <path d="M22 24.5 Q21 26.5 22 27 Q23 27.5 24 27 Q25 26.5 24 24.5" stroke="#b87a5a" stroke-width=".9" fill="none" stroke-linecap="round"/>
    <path d="M19.5 30 Q23 32.5 26.5 30" stroke="#b06050" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <circle cx="13.5" cy="27" r="2" fill="#D9A423" opacity=".85"/>
    <circle cx="32.5" cy="27" r="2" fill="#D9A423" opacity=".85"/>
  </svg>`;

  /* ---------------------------------------------------------------- estilos */
  const css = `
.esc-root{
  --esc-p:${CFG.colorPrincipal};
  --esc-p2:${CFG.colorPrincipalOscuro};
  --esc-p3:#0F1638;
  --esc-a:${CFG.colorAcento};
  --esc-a2:${CFG.colorAcentoOscuro};
  --esc-on-a:${CFG.colorTextoAcento};
  --esc-bg:rgba(20,28,65,0.82);
  --esc-card:rgba(27,37,85,0.72);
  --esc-tx:#F0F4FF;
  --esc-mut:#A8B4CC;
  --esc-br:rgba(217,164,35,0.18);
  --esc-soft:rgba(39,51,110,0.35);
  --esc-radius:18px;
  position:fixed;right:20px;bottom:20px;z-index:2147483000;
  font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  color:var(--esc-tx)
}
.esc-root *{box-sizing:border-box}
.esc-root svg{width:20px;height:20px;flex:none}

/* ---- FAB ---- */
.esc-fab{
  width:62px;height:62px;border-radius:50%;border:0;cursor:pointer;
  background:linear-gradient(135deg,var(--esc-a) 0%,var(--esc-a2) 100%);
  color:var(--esc-on-a);
  box-shadow:0 8px 24px rgba(217,164,35,.45),0 0 0 3px rgba(217,164,35,.15);
  display:grid;place-items:center;
  transition:transform .2s,box-shadow .2s;
  position:relative
}
.esc-fab:hover{transform:scale(1.06);box-shadow:0 12px 32px rgba(217,164,35,.55),0 0 0 4px rgba(217,164,35,.22)}
.esc-fab svg{width:26px;height:26px}
.esc-fab::after{
  content:"";position:absolute;inset:0;border-radius:50%;
  border:2px solid var(--esc-a);
  animation:escPulse 2.4s infinite;pointer-events:none
}
.esc-root.open .esc-fab::after{display:none}
@keyframes escPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.55);opacity:0}}

/* badge de notificación */
.esc-fab-badge{
  position:absolute;top:-2px;right:-2px;
  width:18px;height:18px;border-radius:50%;
  background:#E53E3E;border:2.5px solid #090E20;
  font-size:10px;font-weight:800;color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-family:system-ui;line-height:1
}

/* ---- Burbuja proactiva ---- */
.esc-bubble{
  position:absolute;right:74px;bottom:14px;
  background:rgba(20,28,65,0.90);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  color:var(--esc-tx);
  border:1px solid rgba(217,164,35,.28);
  padding:10px 14px;border-radius:14px 14px 4px 14px;
  box-shadow:0 8px 24px rgba(0,0,0,.45);
  white-space:nowrap;font-size:13.5px;font-weight:500;cursor:pointer;
  opacity:0;transform:translateY(6px);transition:.3s;pointer-events:none
}
.esc-bubble.show{opacity:1;transform:none;pointer-events:auto}
.esc-bubble strong{color:var(--esc-a)}

/* ---- Panel ---- */
.esc-panel{
  position:absolute;right:0;bottom:78px;
  width:358px;max-width:calc(100vw - 32px);
  height:auto;max-height:calc(100vh - 120px);
  background:var(--esc-bg);
  backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);
  border:1px solid rgba(217,164,35,.2);
  border-radius:var(--esc-radius);
  box-shadow:0 32px 64px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04),inset 0 1px 0 rgba(255,255,255,.07);
  display:flex;flex-direction:column;overflow:hidden;
  opacity:0;transform:translateY(14px) scale(.97);pointer-events:none;
  transition:opacity .25s,transform .25s cubic-bezier(.25,.8,.25,1)
}
.esc-root.open .esc-panel{opacity:1;transform:none;pointer-events:auto}
@media(max-width:480px){
  .esc-root{right:14px;bottom:14px}
  .esc-panel{position:fixed;inset:auto 0 0 0;width:100%;max-width:100%;max-height:88vh;border-radius:18px 18px 0 0}
  .esc-root.open .esc-fab,.esc-root.open .esc-bubble{display:none}
}

/* ---- Cabecera ---- */
.esc-head{
  background:linear-gradient(135deg,var(--esc-p2) 0%,#243070 100%);
  padding:16px 16px 14px;
  display:flex;align-items:center;gap:12px;
  border-bottom:1px solid rgba(217,164,35,.15);
  position:relative
}
.esc-av-wrap{position:relative;flex-shrink:0;width:48px;height:48px}
.esc-av-ring{
  position:absolute;inset:-2px;border-radius:50%;
  background:conic-gradient(var(--esc-a),var(--esc-a2),var(--esc-a));
  animation:escSpin 5s linear infinite
}
@keyframes escSpin{to{transform:rotate(360deg)}}
.esc-av{
  position:absolute;inset:2px;border-radius:50%;
  background:#2a1f3d;
  overflow:hidden;display:flex;align-items:center;justify-content:center
}
.esc-av svg{width:44px;height:44px}
.esc-av-online{
  position:absolute;bottom:0;right:0;
  width:13px;height:13px;border-radius:50%;
  background:#3EE07A;border:2.5px solid var(--esc-p2);
  box-shadow:0 0 8px rgba(62,224,122,.7);
  animation:escOnline 2s ease-in-out infinite;z-index:2
}
@keyframes escOnline{0%,100%{box-shadow:0 0 6px rgba(62,224,122,.6)}50%{box-shadow:0 0 14px rgba(62,224,122,.9)}}
.esc-head-info{flex:1;min-width:0}
.esc-head-info b{display:block;font-size:14.5px;font-weight:700;color:#F0F4FF}
.esc-head-info small{
  display:flex;align-items:center;gap:5px;
  font-size:11px;font-weight:600;color:#3EE07A;margin-top:2px;letter-spacing:.01em
}
.esc-head-info small::before{
  content:"";width:7px;height:7px;border-radius:50%;
  background:#3EE07A;box-shadow:0 0 7px #3EE07A;
  animation:escDot 2s ease-in-out infinite;flex-shrink:0
}
@keyframes escDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
.esc-x,.esc-back{
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.11);
  color:rgba(255,255,255,.7);cursor:pointer;
  width:28px;height:28px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;line-height:1;transition:background .15s
}
.esc-x:hover,.esc-back:hover{background:rgba(255,255,255,.14)}
.esc-back{display:none}
.esc-root.in-view .esc-back{display:flex}

/* ---- Cuerpo ---- */
.esc-body{flex:1;overflow:auto;padding:14px}
.esc-view{display:none;height:100%}
.esc-view.active{display:flex;flex-direction:column}

/* ---- Saludo ---- */
.esc-greeting{margin-bottom:12px}
.esc-bubble-bot{
  display:inline-flex;align-items:flex-start;gap:8px;max-width:90%
}
.esc-bubble-dot{
  width:24px;height:24px;border-radius:50%;flex-shrink:0;margin-top:2px;
  background:linear-gradient(135deg,var(--esc-p),var(--esc-p2));
  border:1.5px solid rgba(217,164,35,.3);
  display:flex;align-items:center;justify-content:center
}
.esc-bubble-txt{
  background:rgba(39,51,110,.5);border:1px solid rgba(217,164,35,.12);
  border-radius:4px 14px 14px 14px;
  padding:9px 12px;font-size:13px;line-height:1.55;color:var(--esc-tx)
}
.esc-bubble-txt strong{color:var(--esc-a)}

/* ---- Divisor ---- */
.esc-sep{
  display:flex;align-items:center;gap:8px;
  margin:10px 0 8px
}
.esc-sep-line{flex:1;height:1px;background:rgba(217,164,35,.12)}
.esc-sep-txt{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--esc-mut)}

/* ---- Opciones del menú ---- */
.esc-opts{display:flex;flex-direction:column;gap:8px;padding-bottom:2px}
.esc-opt{
  display:flex;align-items:center;gap:12px;
  width:100%;text-align:left;
  padding:12px 13px;border-radius:12px;
  border:1px solid transparent;
  background:transparent;color:var(--esc-tx);
  cursor:pointer;font:inherit;
  position:relative;overflow:hidden;
  transition:transform .2s cubic-bezier(.25,.8,.25,1),box-shadow .2s,border-color .2s;
  animation:escOptIn .35s both
}
.esc-opt:nth-child(1){animation-delay:.04s}
.esc-opt:nth-child(2){animation-delay:.11s}
.esc-opt:nth-child(3){animation-delay:.18s}
@keyframes escOptIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
/* shimmer */
.esc-opt::before{
  content:"";position:absolute;
  top:0;left:-100%;width:60%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
  transform:skewX(-18deg);transition:left .45s ease;pointer-events:none
}
.esc-opt:hover::before{left:160%}
.esc-opt:hover{transform:translateY(-2px) scale(1.01)}

/* primary */
.esc-opt-primary{
  background:linear-gradient(135deg,rgba(217,164,35,.18),rgba(217,164,35,.08));
  border-color:rgba(217,164,35,.4)
}
.esc-opt-primary:hover{border-color:rgba(217,164,35,.7);box-shadow:0 6px 22px rgba(217,164,35,.22)}
.esc-opt-primary .esc-opt-ic{
  background:linear-gradient(135deg,var(--esc-a),var(--esc-a2));
  color:var(--esc-on-a);
  box-shadow:0 4px 14px rgba(217,164,35,.35)
}
.esc-opt-primary:hover .esc-opt-ic{box-shadow:0 6px 20px rgba(217,164,35,.55);transform:scale(1.08) rotate(-3deg)}
.esc-opt-primary .esc-opt-title{color:var(--esc-a)}
/* secondary */
.esc-opt-secondary{background:rgba(39,51,110,.35);border-color:rgba(100,120,210,.25)}
.esc-opt-secondary:hover{border-color:rgba(100,120,210,.5);box-shadow:0 6px 20px rgba(100,120,210,.18)}
.esc-opt-secondary .esc-opt-ic{background:rgba(39,51,110,.7);border:1px solid rgba(100,120,210,.35);color:#8899E8}
.esc-opt-secondary:hover .esc-opt-ic{transform:scale(1.08);box-shadow:0 4px 14px rgba(100,120,210,.35)}
/* tertiary */
.esc-opt-tertiary{background:rgba(15,22,56,.4);border-color:rgba(80,100,170,.18)}
.esc-opt-tertiary:hover{border-color:rgba(80,100,170,.4);box-shadow:0 6px 16px rgba(80,100,170,.14)}
.esc-opt-tertiary .esc-opt-ic{background:rgba(15,22,56,.8);border:1px solid rgba(80,100,170,.25);color:#6677BB}
.esc-opt-tertiary:hover .esc-opt-ic{transform:scale(1.08);box-shadow:0 4px 12px rgba(80,100,170,.28)}
/* elementos internos */
.esc-opt-ic{
  width:40px;height:40px;border-radius:10px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  transition:transform .2s,box-shadow .2s
}
.esc-opt-ic svg{width:20px;height:20px}
.esc-opt-copy{flex:1;min-width:0}
.esc-opt-title{font-size:13.5px;font-weight:600;line-height:1.2}
.esc-opt-desc{font-size:11px;color:var(--esc-mut);margin-top:2px;line-height:1.4}
.esc-opt-arrow{color:var(--esc-mut);opacity:.45;flex-shrink:0;transition:transform .18s,opacity .18s}
.esc-opt:hover .esc-opt-arrow{transform:translateX(3px);opacity:1}
/* badge "Recomendado" */
.esc-opt-badge{
  position:absolute;top:8px;right:10px;
  font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:var(--esc-on-a);background:var(--esc-a);
  padding:2px 7px;border-radius:20px
}

/* ---- Chat ---- */
.esc-msgs{flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px;padding-bottom:8px;min-height:120px}
.esc-m{
  max-width:85%;padding:10px 13px;border-radius:14px;
  font-size:13.5px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word
}
.esc-m.bot{
  background:rgba(39,51,110,.45);border:1px solid rgba(217,164,35,.1);
  align-self:flex-start;border-bottom-left-radius:4px;color:var(--esc-tx)
}
.esc-m.user{
  background:linear-gradient(135deg,var(--esc-p),var(--esc-p2));
  color:#fff;align-self:flex-end;border-bottom-right-radius:4px
}
.esc-typing{align-self:flex-start;color:var(--esc-mut);font-size:13px}
.esc-chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}
.esc-chip{
  border:1px solid rgba(217,164,35,.22);
  background:rgba(39,51,110,.3);color:var(--esc-tx);
  border-radius:999px;padding:6px 11px;font-size:12px;cursor:pointer;font-family:inherit;
  transition:border-color .15s,background .15s
}
.esc-chip:hover{border-color:var(--esc-a);background:rgba(217,164,35,.1)}
.esc-input{display:flex;gap:8px;border-top:1px solid rgba(255,255,255,.07);padding-top:10px}
.esc-input input{
  flex:1;border:1px solid rgba(217,164,35,.2);
  background:rgba(39,51,110,.3);color:var(--esc-tx);
  border-radius:12px;padding:10px 12px;font:inherit;font-size:13.5px;outline:none
}
.esc-input input:focus{border-color:rgba(217,164,35,.5)}
.esc-input button,.esc-btn{
  border:0;background:linear-gradient(135deg,var(--esc-a),var(--esc-a2));
  color:var(--esc-on-a);border-radius:12px;padding:0 14px;cursor:pointer;
  font:inherit;font-weight:700;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  transition:opacity .15s
}
.esc-input button:hover,.esc-btn:hover{opacity:.88}

/* ---- Voz ---- */
.esc-voice{align-items:center;justify-content:center;text-align:center;gap:16px}
.esc-orb{
  width:140px;height:140px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,var(--esc-a),var(--esc-p));
  box-shadow:0 0 0 0 rgba(217,164,35,.4);transition:transform .2s
}
.esc-orb.listening{animation:escOrb 1.6s infinite}
.esc-orb.speaking{animation:escOrb .7s infinite;transform:scale(1.05)}
@keyframes escOrb{0%{box-shadow:0 0 0 0 rgba(217,164,35,.4)}100%{box-shadow:0 0 0 28px transparent}}
.esc-vstatus{font-size:13.5px;color:var(--esc-mut);min-height:20px}
.esc-vlast{font-size:13px;color:var(--esc-tx);max-width:280px;min-height:40px}
.esc-btn{padding:12px 22px}
.esc-btn.stop{background:linear-gradient(135deg,#E53E3E,#C53030);color:#fff}

/* ---- Formulario ---- */
.esc-form label{display:block;font-size:12.5px;margin:10px 0 4px;color:var(--esc-mut)}
.esc-form input,.esc-form select{
  width:100%;border:1px solid rgba(217,164,35,.18);
  background:rgba(39,51,110,.3);color:var(--esc-tx);
  border-radius:10px;padding:10px 12px;font:inherit;font-size:13.5px;outline:none
}
.esc-form input:focus,.esc-form select:focus{border-color:rgba(217,164,35,.45)}
.esc-form select option{background:#1C2555;color:#F0F4FF}
.esc-form .esc-btn{width:100%;margin-top:16px;padding:13px;font-size:14px}
.esc-ok{display:flex;gap:10px;align-items:flex-start;font-size:14.5px;line-height:1.5}
.esc-ok svg{color:#3EE07A;margin-top:2px;flex-shrink:0}
.esc-legal{font-size:11px;color:var(--esc-mut);margin-top:8px;line-height:1.4}

/* ---- Footer ---- */
.esc-foot{
  text-align:center;font-size:10.5px;color:var(--esc-mut);
  padding:6px 0 10px;
  border-top:1px solid rgba(255,255,255,.05);
  opacity:.65;letter-spacing:.02em
}
.esc-foot span{color:var(--esc-a);font-weight:700;opacity:.8}

/* ---- Demo banner ---- */
.esc-demo{
  font-size:11px;background:rgba(217,164,35,.12);color:var(--esc-a);
  border:1px solid rgba(217,164,35,.25);border-radius:8px;
  padding:6px 9px;margin-bottom:10px
}
.esc-intro{font-size:13px;color:var(--esc-mut);margin:0 0 12px;line-height:1.5}
`;

  /* ---------------------------------------------------------------- HTML */
  const root = document.createElement("div");
  root.className = "esc-root";
  root.innerHTML = `
<style>${css}</style>
<div class="esc-bubble" role="button"><strong>¡Hola!</strong> ${CFG.saludoProactivo}</div>
<div class="esc-panel" role="dialog" aria-label="Asistente de ${CFG.marca}">
  <div class="esc-head">
    <button class="esc-back" aria-label="Volver">←</button>
    <div class="esc-av-wrap">
      <div class="esc-av-ring"></div>
      <div class="esc-av">${AVATAR_SVG}</div>
      <div class="esc-av-online"></div>
    </div>
    <div class="esc-head-info">
      <b>${CFG.nombreAgente} · ${CFG.marca}</b>
      <small>En línea ahora</small>
    </div>
    <button class="esc-x" aria-label="Cerrar">×</button>
  </div>
  <div class="esc-body">

    <!-- MENÚ -->
    <div class="esc-view active" data-view="menu">
      <div class="esc-greeting">
        <div class="esc-bubble-bot">
          <div class="esc-bubble-dot">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="2.5" fill="#D9A423"/>
              <circle cx="6" cy="6" r="5" stroke="#D9A423" stroke-width=".8" opacity=".4"/>
            </svg>
          </div>
          <div class="esc-bubble-txt">¡Hola! Soy ${CFG.nombreAgente}. ¿En qué te puedo ayudar hoy? <strong>¿Por dónde empezamos?</strong></div>
        </div>
      </div>
      <div class="esc-sep">
        <div class="esc-sep-line"></div>
        <span class="esc-sep-txt">Elige cómo continuar</span>
        <div class="esc-sep-line"></div>
      </div>
      <div class="esc-opts">
        <button class="esc-opt esc-opt-primary" data-go="chat" data-prompt="Quiero que me ayudes a elegir el programa ideal para mí.">
          <span class="esc-opt-badge">Recomendado</span>
          <span class="esc-opt-ic">${IC.compass}</span>
          <span class="esc-opt-copy">
            <span class="esc-opt-title">Ayúdame a elegir</span>
            <span class="esc-opt-desc">Cuéntame tu objetivo y te oriento en 2 min</span>
          </span>
          <span class="esc-opt-arrow">${IC.arrow}</span>
        </button>
        <button class="esc-opt esc-opt-secondary" data-go="voz">
          <span class="esc-opt-ic">${IC.mic}</span>
          <span class="esc-opt-copy">
            <span class="esc-opt-title">Hablar con Sofía</span>
            <span class="esc-opt-desc">Consulta por voz, respuesta inmediata</span>
          </span>
          <span class="esc-opt-arrow">${IC.arrow}</span>
        </button>
        <button class="esc-opt esc-opt-tertiary" data-go="form">
          <span class="esc-opt-ic">${IC.phone}</span>
          <span class="esc-opt-copy">
            <span class="esc-opt-title">Que me llame un asesor</span>
            <span class="esc-opt-desc">Deja tu número, te contactamos hoy</span>
          </span>
          <span class="esc-opt-arrow">${IC.arrow}</span>
        </button>
      </div>
    </div>

    <!-- CHAT -->
    <div class="esc-view" data-view="chat">
      ${DEMO_TEXTO ? '<div class="esc-demo">Modo demo · conecta tu webhook en <code>n8nChatUrl</code></div>' : ""}
      <div class="esc-msgs"></div>
      <div class="esc-chips">
        <button class="esc-chip">¿Qué cursos empiezan pronto?</button>
        <button class="esc-chip">¿Cuánto dura un curso?</button>
        <button class="esc-chip">¿Es online?</button>
        <button class="esc-chip">¿Dan certificado?</button>
      </div>
      <form class="esc-input">
        <input type="text" placeholder="Escribe tu pregunta…" aria-label="Mensaje" required>
        <button type="submit">${IC.arrow}</button>
      </form>
    </div>

    <!-- VOZ -->
    <div class="esc-view esc-voice" data-view="voz">
      ${DEMO_VOZ ? '<div class="esc-demo">Modo demo · pon el ID de tu agente en <code>elevenlabsAgentId</code></div>' : ""}
      <div class="esc-orb"></div>
      <div class="esc-vstatus">Pulsa para empezar. Te pediremos permiso para el micrófono.</div>
      <div class="esc-vlast"></div>
      <button class="esc-btn esc-vbtn">${IC.mic}<span>Empezar conversación</span></button>
    </div>

    <!-- FORM -->
    <div class="esc-view" data-view="form">
      <form class="esc-form">
        <p class="esc-intro">Déjanos tus datos y un asesor de admisiones te contacta hoy mismo.</p>
        <label>Nombre</label>
        <input name="nombre" required autocomplete="name" placeholder="Tu nombre completo">
        <label>WhatsApp</label>
        <input name="telefono" type="tel" required placeholder="+51 9xx xxx xxx" autocomplete="tel">
        <label>Correo</label>
        <input name="email" type="email" autocomplete="email" placeholder="tu@email.com">
        <label>¿Qué te interesa?</label>
        <select name="interes">
          <option>Aún no lo sé, quiero orientación</option>
          <option>Un curso concreto</option>
          <option>Formas de pago</option>
          <option>Avisarme de próximas ediciones</option>
        </select>
        <label style="display:flex;gap:8px;align-items:flex-start;color:var(--esc-mut)">
          <input type="checkbox" name="acepto" required style="width:auto;margin-top:3px;accent-color:var(--esc-a)">
          Acepto ser contactado y la política de privacidad.
        </label>
        <button class="esc-btn" type="submit">Quiero que me llamen</button>
        <p class="esc-legal">Tus datos se usan solo para informarte sobre ${CFG.marca}.</p>
      </form>
    </div>

  </div>
  <div class="esc-foot">Asistente con IA · <span>FLUENTIA</span></div>
</div>
<button class="esc-fab" aria-label="Abrir asistente de ${CFG.marca}">
  ${IC.chat}
  <div class="esc-fab-badge">1</div>
</button>`;
  document.body.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const $$ = (s) => root.querySelectorAll(s);

  /* ---------------------------------------------------------------- navegación */
  function abrir() {
    root.classList.add("open");
    $(".esc-bubble").classList.remove("show");
    $(".esc-fab-badge").style.display = "none";
  }
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

  $$(".esc-opt").forEach((b) => {
    b.onclick = () => {
      const go = b.dataset.go;
      if (go === "wa") return abrirWhatsapp();
      ir(go);
      if (go === "chat") iniciarChat(b.dataset.prompt);
    };
  });

  // Elementos externos con data-escale-agente="voz|chat|form|wa" abren el widget directo
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
    setTimeout(() => {
      if (!root.classList.contains("open")) $(".esc-bubble").classList.add("show");
    }, CFG.saludoProactivoSegundos * 1000);
  }

  /* ---------------------------------------------------------------- CHAT (n8n) */
  const sessionId = (() => {
    try {
      let s = localStorage.getItem("esc_sid");
      if (!s) { s = crypto.randomUUID(); localStorage.setItem("esc_sid", s); }
      return s;
    } catch (e) { return "s-" + Math.random().toString(36).slice(2); }
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
      pintar(`Hola, soy ${CFG.nombreAgente}. Cuéntame qué te gustaría conseguir en tu carrera y te recomiendo el programa que mejor encaja.`, "bot");
    }
    if (promptInicial) enviar(promptInicial);
    setTimeout(() => $(".esc-input input").focus(), 50);
  }
  async function enviar(texto) {
    pintar(texto, "user");
    $(".esc-chips").style.display = "none";
    const t = document.createElement("div");
    t.className = "esc-typing";
    t.textContent = `${CFG.nombreAgente} está escribiendo…`;
    $(".esc-msgs").appendChild(t);
    let respuesta;
    try {
      if (DEMO_TEXTO) {
        await new Promise((r) => setTimeout(r, 900));
        respuesta = respuestaDemo(texto);
      } else {
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
      respuesta = "Ahora mismo tengo un problema de conexión. Si quieres, escríbenos directamente y te atendemos enseguida.";
    }
    t.remove();
    pintar(respuesta, "bot");
    track("esc_chat_mensaje");
  }
  $(".esc-input").onsubmit = (e) => {
    e.preventDefault();
    const i = $(".esc-input input");
    const v = i.value.trim();
    if (!v) return;
    i.value = "";
    enviar(v);
  };
  $$(".esc-chip").forEach((c) => (c.onclick = () => enviar(c.textContent)));

  // Respuestas demo con datos reales de escale.edu.pe (oct-2026)
  function respuestaDemo(t) {
    t = t.toLowerCase();
    if (t.includes("elegir") || t.includes("recomiend"))
      return "Perfecto. Para recomendarte bien, 3 preguntas rápidas:\n1) ¿Cuál es tu cargo y en qué sector trabajas?\n2) ¿Qué quieres conseguir (ascender, liderar un área, emprender)?\n3) ¿Te viene mejor entre semana por la noche o sábado por la mañana?";
    if (t.includes("pronto") || t.includes("empiez") || t.includes("inicio") || t.includes("curso") || t.includes("programa"))
      return "Estos empiezan en octubre:\n• Marketing para Restaurantes – 10 oct (sáb.)\n• Reputación Corporativa y Crisis – 13 oct (mar.)\n• Neuro Branding – 15 oct (jue.)\n• Compras y Abastecimiento – 20 oct (mar.)\n¿Cuál te llama más la atención?";
    if (t.includes("online") || t.includes("digital") || t.includes("presencial"))
      return "Sí, todas las clases son online en vivo: te conectas con tu mentor y tus compañeros en el horario del curso.";
    if (t.includes("dura") || t.includes("tiempo") || t.includes("horas"))
      return "Cada Curso de Alta Especialización (CAE) son 24 horas académicas en 8 sesiones de 3 horas, una por semana.";
    if (t.includes("certific"))
      return "Sí. Al completar las horas académicas recibes un certificado emitido por Escale, con certificación ISO 21001.";
    if (t.includes("precio") || t.includes("cuesta") || t.includes("pago") || t.includes("inversi"))
      return "Un Curso de Alta Especialización tiene una inversión de S/ 1,980. Las formas de pago te las detalla un asesor. ¿Quieres que te contacte?";
    return "Buena pregunta. En la versión real te respondo con toda la información de Escale. ¿Quieres que un asesor te contacte hoy?";
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
        onConnect: () => {
          vst.textContent = "Te escucho… habla cuando quieras.";
          orb.className = "esc-orb listening";
          vbtnTxt(IC.stop, "Terminar");
          vbtn.classList.add("stop");
          vbtn.disabled = false;
          track("esc_voz_inicio");
        },
        onDisconnect: () => resetVoz("Conversación terminada. ¡Gracias!"),
        onError: () => resetVoz("No se pudo conectar. Prueba de nuevo o usa el chat."),
        onModeChange: ({ mode }) => {
          orb.className = "esc-orb " + (mode === "speaking" ? "speaking" : "listening");
          vst.textContent = mode === "speaking" ? `${CFG.nombreAgente} está hablando…` : "Te escucho…";
        },
        onMessage: (m) => { if ((m.role || m.source) !== "user") vlast.textContent = m.message; },
      });
    } catch (e) {
      resetVoz(
        e && e.name === "NotAllowedError"
          ? "Necesito permiso de micrófono para hablar contigo."
          : "No se pudo iniciar la voz. Prueba con el chat."
      );
    }
  }
  function resetVoz(msg) {
    conv = null; orb.className = "esc-orb"; vbtn.disabled = false;
    vbtnTxt(IC.mic, "Empezar conversación"); vbtn.classList.remove("stop");
    if (msg) vst.textContent = msg;
  }
  async function pararVoz() {
    if (conv) { const c = conv; conv = null; try { await c.endSession(); } catch (e) {} resetVoz(); }
  }
  vbtn.onclick = () => (conv ? pararVoz() : empezarVoz());

  /* ---------------------------------------------------------------- FORMULARIO (lead) */
  $(".esc-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const datos = Object.fromEntries(new FormData(f));
    datos.origen = "widget-web"; datos.pagina = location.href;
    datos.fecha = new Date().toISOString(); datos.sessionId = sessionId;
    const btn = f.querySelector(".esc-btn"); btn.disabled = true; btn.textContent = "Enviando…";
    try {
      if (CFG.n8nLeadUrl) {
        const r = await fetch(CFG.n8nLeadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });
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
      alert("No se pudo enviar. Escríbenos directamente y te atendemos.");
    }
  };

  /* ---------------------------------------------------------------- analítica */
  function track(evento, params) {
    params = params || {};
    try {
      if (window.gtag) window.gtag("event", evento, params);
      if (window.dataLayer) window.dataLayer.push(Object.assign({ event: evento }, params));
    } catch (e) {}
  }
})();
