import { useState, useRef, useEffect, useCallback } from "react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_KEY;
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const ROLES = [
  {
    id: "cto", title: "CTO / Braço Direito", icon: "⚡", color: "#f59e0b",
    desc: "Lidera a arquitetura técnica e complementa o fundador.",
    evaluate: ["Toma decisão técnica sob pressão","Lidera sem depender do CEO","Traduz tech em negócio","Lealdade e visão de longo prazo","Projetos reais em produção"],
    questions: [
      "Me conta de um projeto que você construiu do zero — não um curso, algo real que você fez.",
      "Você já teve uma ideia que as pessoas ao redor acharam boa mas você sabia que era errada. O que você fez?",
      "Se eu te disser que não vou te pagar agora mas você vai ter participação no que a gente construir — o que você pensa?",
      "Me fala de uma vez que você falhou tecnicamente e o que isso te ensinou sobre você mesmo.",
      "Como você age quando está num projeto e percebe que a direção está errada?",
      "O que você faria nas próximas 2 semanas se entrasse hoje no time?",
      "Você consegue trabalhar sem estrutura, sem processo definido, sem chefe? Me dá um exemplo.",
      "O que te faz levantar de manhã — de verdade, não a resposta bonita.",
      "Se você pudesse escolher qualquer pessoa no mundo para construir algo junto, quem seria e por quê?",
      "Qual é a coisa que você construiu que mais te orgulha? Me explica o porquê.",
      "Você já convenceu alguém a acreditar em algo que parecia impossível? Como foi?",
      "O que você acha que eu deveria estar te perguntando e não estou?"
    ]
  },
  {
    id: "ai", title: "Dev IA / ML", icon: "🧠", color: "#8b5cf6",
    desc: "Constrói modelos, integrações de IA e automação inteligente.",
    evaluate: ["Projeto real de IA — não curso","Conhece Python + frameworks","Sabe quando usar API vs treinar","Explica o complexo de forma simples","Visão prática, não só teórica"],
    questions: [
      "Me mostra algo que você construiu com IA por conta própria — código, projeto, experimento real.",
      "Qual foi a ideia mais maluca que você teve com IA? Chegou a tentar?",
      "Se você tivesse 30 dias e acesso a qualquer API, o que você construiria?",
      "Quando faz sentido usar uma API pronta versus treinar seu próprio modelo?",
      "Me explica o que é overfitting como se eu tivesse 14 anos.",
      "Você já trabalhou com dados ruins ou incompletos? Como resolveu?",
      "O que te frustra mais no estado atual da IA?",
      "Qual tecnologia de IA você acha que está superestimada agora? Por quê?",
      "Como você saberia que um modelo que você fez está funcionando de verdade em produção?",
      "O que te fez se interessar por IA — de verdade, não a resposta de LinkedIn.",
      "Você conseguiria construir algo útil com IA em uma semana sozinho? O quê?",
      "O que você acha que eu deveria estar te perguntando e não estou?"
    ]
  },
  {
    id: "fullstack", title: "Dev Full Stack", icon: "💻", color: "#10b981",
    desc: "Constrói produtos web e mobile. Precisa resolver sozinho.",
    evaluate: ["App em produção com usuários reais","Domina React + Node ou similar","Resolve bug sem ajuda constante","Aprende rápido","Escreve código que outros entendem"],
    questions: [
      "Me mostra um projeto seu que está no ar — não importa o tamanho, quero ver algo real.",
      "Qual foi o bug mais difícil que você já resolveu? Como chegou na solução?",
      "Você já construiu algo do zero sem tutorial? Me conta.",
      "Se eu te der uma ideia hoje, em quanto tempo você consegue ter algo funcionando?",
      "O que você faz quando trava num problema por mais de 2 horas?",
      "Me explica autenticação de usuário como se eu não soubesse nada de programação.",
      "Qual stack você usaria hoje para construir um app mobile rápido e por quê?",
      "Você prefere trabalhar sozinho ou em duo? Por quê?",
      "O que você faria diferente num projeto que já fez se pudesse refazer?",
      "O que te faz gostar de programar — de verdade?",
      "Você já ensinou programação pra alguém? Como foi?",
      "O que você acha que eu deveria estar te perguntando e não estou?"
    ]
  },
  {
    id: "robotics", title: "Dev Robótica", icon: "🤖", color: "#3b82f6",
    desc: "Hardware, sensores e automação física conectada com software.",
    evaluate: ["Projeto físico real — foto ou vídeo","Conhece C/C++ ou MicroPython","Transita entre hardware e software","Paciência pra debugar o físico","Entende eletrônica básica"],
    questions: [
      "Me mostra foto ou vídeo de algo físico que você já construiu com tecnologia.",
      "Qual foi o momento mais frustrante de um projeto de hardware? Como resolveu?",
      "Você consegue comprar componente errado e ainda fazer funcionar? Me dá um exemplo.",
      "Me explica a diferença entre Arduino e Raspberry Pi como se eu fosse tomar uma decisão agora.",
      "Você já teve um componente falhando de forma intermitente? Como diagnosticou?",
      "O que te atrai na robótica que software puro não te daria?",
      "Se você tivesse R$500 e 30 dias, o que construiria?",
      "Como você conectaria um sensor físico a um app em tempo real?",
      "O que você faria diferente num projeto de hardware que já fez?",
      "Qual é o maior mito sobre robótica que você ouve frequentemente?",
      "Você consegue ensinar eletrônica básica pra alguém em 5 minutos? Me ensina agora.",
      "O que você acha que eu deveria estar te perguntando e não estou?"
    ]
  },
  {
    id: "designer", title: "Designer UI/UX", icon: "🎨", color: "#ec4899",
    desc: "Identidade visual e experiência do usuário em todos os produtos.",
    evaluate: ["Portfolio com produto digital real","Domina Figma a fundo","Explica decisões com base no usuário","Recebe feedback sem ego","Pensa em sistema, não tela individual"],
    questions: [
      "Me mostra algo do seu portfolio e me explica cada decisão de design que tomou.",
      "Qual foi o design que você mais se orgulha e por quê?",
      "Me fala de um design que você fez e que não funcionou. O que aprendeu?",
      "Como você convenceria alguém que não entende de design a confiar na sua visão?",
      "O que você faria se o fundador pedisse algo que você sabe que vai prejudicar a experiência?",
      "Você já validou um design com usuários reais? Como foi o processo?",
      "Me explica design system com suas próprias palavras.",
      "O que muda quando você projeta para mobile versus desktop?",
      "Qual app ou produto você acha que tem o melhor design hoje? Por quê?",
      "O que te irrita mais em interfaces mal feitas?",
      "Você consegue criar uma identidade visual do zero em uma semana? Como abordaria?",
      "O que você acha que eu deveria estar te perguntando e não estou?"
    ]
  },
  {
    id: "growth", title: "Growth / Marketing", icon: "📈", color: "#f97316",
    desc: "Aquisição de pessoas, conteúdo e crescimento do movimento.",
    evaluate: ["Cresceu algo com números reais","Obcecado por métricas","Criativo pra conteúdo que conecta","Pensa em funil completo","Entende redes sociais a fundo"],
    questions: [
      "Me mostra algo que você fez crescer — comunidade, conta, projeto, qualquer coisa com número real.",
      "Como você conseguiria as primeiras 100 pessoas certas para um movimento novo sem gastar nada?",
      "Qual foi a ação de marketing mais criativa que você já executou?",
      "Me explica o que é CAC e LTV como se eu fosse um dev que nunca ouviu falar.",
      "Você já criou conteúdo que viralizou ou chegou perto? O que aconteceu?",
      "O que você faria nos primeiros 30 dias aqui para gerar tração?",
      "Qual rede social você acha que está sendo ignorada por todo mundo agora?",
      "Como você diferenciaria uma startup de tecnologia jovem no mercado hoje?",
      "O que é mais difícil: atrair pessoas novas ou manter as que já estão?",
      "Você já construiu uma comunidade — online ou offline? Como foi?",
      "O que te move no marketing — de verdade, sem resposta bonita?",
      "O que você acha que eu deveria estar te perguntando e não estou?"
    ]
  }
];

const SYSTEM = `Você é o Merlin — o conselheiro pessoal e mentor de um jovem fundador de 19 anos chamado Mackson, que está montando a Tesserakt: uma startup de tecnologia com produtos de IA, mobile e robótica.

Mackson está selecionando 7 pessoas para o time fundador. Não é uma entrevista corporativa com salário — é uma busca por parceiros que vão entrar por visão, por potencial e por vontade de construir algo grande juntos. As pessoas que ele selecionar vão ajudá-lo a levantar e criar a startup.

Seu papel é ser o cara no ouvido do Mackson — como o Merlin no Kingsman. Você é extremamente experiente, direto, inteligente e fala como um amigo sênior que já viu tudo. Você não analisa de forma fria — você GUIA em tempo real.

Quando Mackson te mandar o que a pessoa respondeu:
- Leia o que foi dito nas entrelinhas, não só o texto
- Diga: ✅ FORTE / ⚠️ ATENÇÃO / ❌ FRACO — e explica em 2 linhas por quê
- Diga EXATAMENTE o que ele deve falar ou perguntar agora — frase literal se precisar
- Se a resposta for boa, diz como aprofundar e extrair mais
- Se for fraca, diz como salvar a conversa ou quando desistir
- Se perceber que a pessoa tem potencial mas está nervosa, diz como deixar ela à vontade
- Se perceber que está blefando ou encenando, expõe isso diretamente
- Pensa em termos de: essa pessoa tem fogo? vai aguentar a pressão? vai aparecer quando der trabalho?

Comandos especiais que Mackson pode usar:
- "?" → diz o que perguntar agora nesse contexto
- "pausa" → diz como usar o silêncio e o que observar
- "blef?" → analisa se a pessoa está exagerando ou inventando
- "perfil" → dá uma leitura completa do perfil da pessoa até agora
- "convencer" → diz como apresentar a oportunidade da Tesserakt pra essa pessoa de forma irresistível
- "desistir?" → analisa se vale continuar com essa pessoa ou não
- "próxima" → sugere a melhor pergunta para fazer agora baseado no que já foi dito

Sobre a Tesserakt:
- É uma startup de tecnologia liderada por Mackson Victor, 19 anos, do Maranhão
- Produtos: CHEVEL AI, NEXO (app mobile), WIESEL-E (robótica), Dário AI, entre outros
- O time que está sendo montado agora são os 7 primeiros membros — cofundadores de fato
- Não há salário agora: a proposta é participação, aprendizado e construir algo real juntos
- Mackson busca pessoas com fogo, não apenas com currículo

Responda sempre em português brasileiro, de forma direta e humana. Você é o melhor amigo mais experiente do Mackson. Fale como tal.`;

const SCORE_SYSTEM = `Você é um advisor experiente de startups. Avalie o candidato abaixo para entrar como um dos 7 primeiros membros do time fundador da Tesserakt — uma startup de tecnologia jovem sem salário, movida por visão.

Retorne APENAS JSON válido, sem markdown, sem texto extra:
{
  "nota_geral": <0 a 10, uma casa decimal>,
  "recomendacao": "ENTRAR NO TIME" | "CONVERSAR MAIS" | "NÃO É A HORA",
  "resumo": "<2-3 frases diretas sobre essa pessoa>",
  "tem_fogo": true | false,
  "pontos_fortes": ["<ponto 1>", "<ponto 2>", "<ponto 3>"],
  "pontos_atencao": ["<ponto 1>", "<ponto 2>"],
  "fit_cultural": "<alto | médio | baixo>",
  "veredicto": "<1 frase final contundente sobre se essa pessoa deve entrar ou não>"
}`;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem("t_history") || "[]"); } catch { return []; }
}
function saveHistory(h) { localStorage.setItem("t_history", JSON.stringify(h)); }

async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, max_tokens: 1024, messages: [{ role: "system", content: SYSTEM }, ...messages] })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || "Erro na resposta.";
}

async function generateScore(session) {
  const role = ROLES.find(r => r.id === session.roleId);
  const answeredCount = Object.keys(session.answeredQ || {}).length;
  const answersText = Object.entries(session.answeredQ || {})
    .map(([i, ans]) => `P${parseInt(i)+1}: "${role.questions[parseInt(i)]}"\nR: "${ans}"`).join("\n\n");
  const prompt = `Candidato: ${session.candidateName}\nCargo pretendido: ${role.title}\nPerguntas respondidas: ${answeredCount}/12\n\nRespostas:\n${answersText}`;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, max_tokens: 900, messages: [{ role: "system", content: SCORE_SYSTEM }, { role: "user", content: prompt }] })
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { return null; }
}

function triggerPrintExport(session, scoreData) {
  const role = ROLES.find(r => r.id === session.roleId);
  const date = new Date(session.date).toLocaleDateString("pt-BR");
  const answeredCount = Object.keys(session.answeredQ || {}).length;
  const recColor = scoreData?.recomendacao === "ENTRAR NO TIME" ? "#16a34a"
    : scoreData?.recomendacao === "CONVERSAR MAIS" ? "#d97706" : "#dc2626";

  const answersHTML = Object.entries(session.answeredQ || {}).map(([i, ans]) => {
    const q = role.questions[parseInt(i)];
    const msgIdx = session.messages?.findIndex(m => m.role === "user" && m.content?.includes(q));
    const aiMsg = msgIdx >= 0 ? session.messages[msgIdx + 1] : null;
    const aiText = aiMsg?.content?.replace(/\*\*(.*?)\*\*/g, "$1").replace(/<[^>]*>/g, "").replace(/\n/g, " ") || "";
    return `
      <div style="margin-bottom:20px;padding:16px;background:#fafafa;border-radius:10px;border-left:3px solid #111;page-break-inside:avoid;">
        <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Pergunta ${parseInt(i)+1}</div>
        <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:8px;">${q}</div>
        <div style="font-size:13px;color:#333;line-height:1.6;margin-bottom:${aiText ? 10 : 0}px;">${ans}</div>
        ${aiText ? `<div style="font-size:12px;color:#555;background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:10px 12px;line-height:1.5;"><strong>Merlin:</strong> ${aiText.slice(0, 400)}${aiText.length > 400 ? "..." : ""}</div>` : ""}
      </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${session.candidateName} — Tesserakt</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#fff;color:#111;padding:48px;max-width:820px;margin:0 auto;font-size:14px;line-height:1.6;}
  .print-btn{position:fixed;top:16px;right:16px;background:#111;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2);}
  @media print{.print-btn{display:none;}body{padding:20px;}}
  h1{font-size:30px;font-weight:900;letter-spacing:-1px;margin-bottom:6px;}
  .badge{display:inline-block;background:#111;color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;}
  .score-block{background:#f5f5f5;border-radius:16px;padding:24px;margin:24px 0;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0;}
  .veredicto{background:#111;color:#fff;border-radius:12px;padding:14px 18px;font-size:14px;font-weight:700;font-style:italic;margin-top:14px;}
  .section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin:28px 0 14px;}
  .notes{background:#fffbeb;border-radius:10px;padding:14px;border:1px solid #fde68a;margin-bottom:20px;}
</style></head>
<body>
<button class="print-btn" onclick="window.print()">🖨 Salvar como PDF</button>

<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:20px;margin-bottom:28px;">
  <div>
    <div style="font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#888;">Tesserakt · Seleção de Time</div>
    <div style="font-size:11px;color:#aaa;margin-top:4px;">${date}</div>
  </div>
  <div style="font-size:11px;color:#888;text-align:right;">${answeredCount}/12 perguntas</div>
</div>

<h1>${session.candidateName}</h1>
<div style="margin:10px 0 24px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
  <span class="badge">${role.icon} ${role.title}</span>
  ${session.linkedin ? `<span style="font-size:12px;color:#888;">🔗 ${session.linkedin}</span>` : ""}
</div>

${scoreData ? `
<div class="score-block">
  <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:14px;">Avaliação Final — Merlin</div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
    <div style="display:flex;align-items:baseline;gap:4px;">
      <span style="font-size:58px;font-weight:900;letter-spacing:-3px;line-height:1;">${scoreData.nota_geral}</span>
      <span style="font-size:20px;color:#888;"> / 10</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
      <div style="background:${recColor};color:#fff;padding:10px 22px;border-radius:30px;font-weight:900;font-size:13px;">${scoreData.recomendacao}</div>
      <div style="font-size:12px;color:#888;">Fogo: ${scoreData.tem_fogo ? "🔥 Sim" : "❄️ Não"} · Fit cultural: ${scoreData.fit_cultural}</div>
    </div>
  </div>
  <div style="font-size:14px;color:#333;line-height:1.7;margin-bottom:14px;">${scoreData.resumo}</div>
  <div class="two-col">
    <div>
      <div style="font-size:10px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Pontos Fortes</div>
      ${(scoreData.pontos_fortes||[]).map(p=>`<div style="font-size:12px;color:#333;margin-bottom:6px;display:flex;gap:6px;"><span style="color:#16a34a;font-weight:800;">+</span>${p}</div>`).join("")}
    </div>
    <div>
      <div style="font-size:10px;font-weight:800;color:#d97706;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Pontos de Atenção</div>
      ${(scoreData.pontos_atencao||[]).map(p=>`<div style="font-size:12px;color:#333;margin-bottom:6px;display:flex;gap:6px;"><span style="color:#d97706;font-weight:800;">⚠</span>${p}</div>`).join("")}
    </div>
  </div>
  <div class="veredicto">"${scoreData.veredicto}"</div>
</div>` : ""}

${session.notes ? `<div class="notes"><div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📝 Suas Notas</div><div style="font-size:13px;color:#78350f;white-space:pre-wrap;">${session.notes}</div></div>` : ""}

<div class="section-title">Respostas</div>
${answersHTML}

<div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:11px;color:#aaa;text-align:center;">Tesserakt · Seleção de Time Fundador · ${date}</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

function fmt(text) {
  return (text || "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/✅/g, '<span style="color:#16a34a;font-weight:700">✅</span>')
    .replace(/⚠️/g, '<span style="color:#d97706;font-weight:700">⚠️</span>')
    .replace(/❌/g, '<span style="color:#dc2626;font-weight:700">❌</span>')
    .replace(/→/g, '<span style="opacity:0.4">→</span>')
    .replace(/\n/g, "<br/>");
}

function getTheme(dark) {
  return dark ? {
    bg:"#0f0f0f",surface:"#191919",border:"#2a2a2a",
    text:"#f0f0f0",textSub:"#777",textMuted:"#444",
    s1:"#080808",s2:"#282828",
    chatBg:"#131313",userBub:"#efefef",userTxt:"#111",aiBub:"#202020",aiTxt:"#f0f0f0",
  } : {
    bg:"#e8e8e8",surface:"#e8e8e8",border:"#d4d4d4",
    text:"#111",textSub:"#888",textMuted:"#aaa",
    s1:"#c8c8c8",s2:"#ffffff",
    chatBg:"#e4e4e4",userBub:"#111",userTxt:"#f5f5f5",aiBub:"#e8e8e8",aiTxt:"#111",
  };
}

function n(t, inset=false, sm=false) {
  const r = sm ? 10 : 16;
  const sh = inset
    ? `inset 4px 4px 10px ${t.s1}, inset -4px -4px 10px ${t.s2}`
    : `${sm?"3px 3px 8px":"6px 6px 16px"} ${t.s1}, ${sm?"-3px -3px 8px":"-6px -6px 16px"} ${t.s2}`;
  return { background: t.surface, boxShadow: sh, borderRadius: r };
}

function Logo({ size=32, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="50,2 93,26 93,74 50,98 7,74 7,26" stroke={color} strokeWidth="4" fill="none"/>
      <polygon points="50,22 73,35 73,65 50,78 27,65 27,35" stroke={color} strokeWidth="4" fill="none"/>
      <line x1="50" y1="2" x2="50" y2="22" stroke={color} strokeWidth="4"/>
      <line x1="93" y1="26" x2="73" y2="35" stroke={color} strokeWidth="4"/>
      <line x1="93" y1="74" x2="73" y2="65" stroke={color} strokeWidth="4"/>
      <line x1="50" y1="98" x2="50" y2="78" stroke={color} strokeWidth="4"/>
      <line x1="7" y1="74" x2="27" y2="65" stroke={color} strokeWidth="4"/>
      <line x1="7" y1="26" x2="27" y2="35" stroke={color} strokeWidth="4"/>
    </svg>
  );
}

function Dots({ dark }) {
  return (
    <div style={{display:"flex",gap:5,padding:"6px 2px",alignItems:"center"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:6,height:6,borderRadius:"50%",background:dark?"#888":"#555",animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
      ))}
    </div>
  );
}

// Quick action buttons
const QUICK_ACTIONS = [
  { label: "?", desc: "O que perguntar agora?", msg: "?" },
  { label: "🔍 Perfil", desc: "Leitura do perfil até agora", msg: "perfil" },
  { label: "🎭 Blef?", desc: "Está exagerando?", msg: "blef?" },
  { label: "🔥 Convencer", desc: "Como apresentar a Tesserakt", msg: "convencer" },
  { label: "⏸ Pausa", desc: "Como usar o silêncio", msg: "pausa" },
  { label: "⏭ Próxima", desc: "Melhor próxima pergunta", msg: "próxima" },
  { label: "🚪 Desistir?", desc: "Vale continuar?", msg: "desistir?" },
];

// ─── ROLES SCREEN ─────────────────────────────────────────────────────────────
function RolesScreen({ onSelect, onHistory, historyCount, t: theme }) {
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"48px 16px 32px"}}>
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{display:"inline-flex",...n(theme),width:88,height:88,borderRadius:24,alignItems:"center",justifyContent:"center",marginBottom:22}}>
          <Logo size={46} color={theme.text}/>
        </div>
        <h1 style={{fontSize:28,fontWeight:900,letterSpacing:-1,color:theme.text,marginBottom:8}}>Tesserakt · Seleção de Time</h1>
        <p style={{fontSize:14,color:theme.textSub,marginBottom:8}}>Encontre os 7 primeiros membros do time fundador</p>
        <p style={{fontSize:12,color:theme.textMuted,marginBottom:22}}>O Merlin te guia em tempo real durante cada conversa</p>
        {historyCount > 0 && (
          <button onClick={onHistory}
            style={{...n(theme,false,true),border:"none",padding:"9px 18px",fontFamily:"inherit",fontSize:13,color:theme.textSub,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7}}>
            🗂 Histórico
            <span style={{background:theme.text,color:theme.bg,borderRadius:20,padding:"1px 9px",fontSize:11,fontWeight:700}}>{historyCount}</span>
          </button>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(290px, 1fr))",gap:14}}>
        {ROLES.map((role,i)=>(
          <button key={role.id} onClick={()=>onSelect(role)}
            style={{...n(theme),borderRadius:20,padding:22,cursor:"pointer",border:"none",textAlign:"left",animation:`fadeUp .4s ease ${i*60}ms both`,transition:"transform .2s",fontFamily:"inherit"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12}}>
              <div style={{...n(theme,true),width:40,height:40,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{role.icon}</div>
              <span style={{fontWeight:800,fontSize:14,color:theme.text}}>{role.title}</span>
            </div>
            <p style={{fontSize:13,color:theme.textSub,lineHeight:1.55,marginBottom:14}}>{role.desc}</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:role.color,boxShadow:`0 0 8px ${role.color}`}}/>
              <span style={{fontSize:11,color:theme.textMuted}}>12 perguntas · Merlin ao vivo</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CANDIDATE SCREEN ─────────────────────────────────────────────────────────
function CandidateScreen({ role, onStart, onBack, t: theme }) {
  const [name,setName]=useState("");
  const [linkedin,setLinkedin]=useState("");
  const [obs,setObs]=useState("");
  return (
    <div style={{maxWidth:500,margin:"56px auto 0",padding:"0 16px"}}>
      <div style={{...n(theme),padding:34,borderRadius:26,animation:"fadeUp .4s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:28}}>
          <div style={{...n(theme,true),width:46,height:46,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:23}}>{role.icon}</div>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:theme.text}}>{role.title}</div>
            <div style={{fontSize:12,color:theme.textSub}}>Nova conversa</div>
          </div>
        </div>
        {[
          {label:"Nome *",ph:"Ex: João Silva",val:name,set:setName},
          {label:"LinkedIn (opcional)",ph:"linkedin.com/in/...",val:linkedin,set:setLinkedin},
        ].map(({label,ph,val,set})=>(
          <div key={label} style={{marginBottom:14}}>
            <div style={{fontSize:12,color:theme.textSub,marginBottom:7,fontWeight:600}}>{label}</div>
            <div style={{...n(theme,true),padding:"11px 15px",borderRadius:12}}>
              <input placeholder={ph} value={val} onChange={e=>set(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onStart({name:name.trim(),linkedin,obs});}}
                style={{background:"none",border:"none",outline:"none",fontFamily:"inherit",fontSize:14,color:theme.text,width:"100%"}}/>
            </div>
          </div>
        ))}
        <div style={{marginBottom:22}}>
          <div style={{fontSize:12,color:theme.textSub,marginBottom:7,fontWeight:600}}>Contexto inicial (opcional)</div>
          <div style={{...n(theme,true),padding:"11px 15px",borderRadius:12}}>
            <textarea placeholder="Como chegou até você? Indicação? Impressão inicial?" value={obs}
              onChange={e=>setObs(e.target.value)} rows={3}
              style={{background:"none",border:"none",outline:"none",fontFamily:"inherit",fontSize:13,color:theme.text,width:"100%",resize:"none",lineHeight:1.5}}/>
          </div>
        </div>
        <button disabled={!name.trim()} onClick={()=>onStart({name:name.trim(),linkedin,obs})}
          style={{width:"100%",padding:"13px 0",borderRadius:13,border:"none",background:name.trim()?theme.text:theme.border,color:name.trim()?theme.bg:theme.textMuted,fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:name.trim()?"pointer":"not-allowed",transition:"all .2s"}}>
          Começar →
        </button>
        <button onClick={onBack}
          style={{width:"100%",marginTop:10,...n(theme,false,true),border:"none",padding:"10px 0",fontFamily:"inherit",fontSize:13,color:theme.textSub,cursor:"pointer"}}>
          ← Voltar
        </button>
      </div>
    </div>
  );
}

// ─── SUMMARY SCREEN ───────────────────────────────────────────────────────────
function SummaryScreen({ session, onBack, t: theme }) {
  const [score,setScore]=useState(null);
  const [loading,setLoading]=useState(true);
  const [exporting,setExporting]=useState(false);
  const role=ROLES.find(r=>r.id===session.roleId);
  const answeredCount=Object.keys(session.answeredQ||{}).length;

  useEffect(()=>{
    generateScore(session).then(s=>{setScore(s);setLoading(false);});
  },[]);

  const recColor=score?.recomendacao==="ENTRAR NO TIME"?"#16a34a":score?.recomendacao==="CONVERSAR MAIS"?"#d97706":"#dc2626";

  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"32px 16px 48px"}}>
      <div style={{...n(theme),padding:30,borderRadius:26,animation:"fadeUp .4s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
          <div style={{...n(theme,true),width:52,height:52,borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{role?.icon}</div>
          <div>
            <div style={{fontWeight:900,fontSize:20,color:theme.text}}>{session.candidateName}</div>
            <div style={{fontSize:13,color:theme.textSub}}>{role?.title} · {answeredCount}/12 · {new Date(session.date).toLocaleDateString("pt-BR")}</div>
            {session.linkedin&&<div style={{fontSize:11,color:theme.textMuted,marginTop:2}}>🔗 {session.linkedin}</div>}
          </div>
        </div>

        {/* progress */}
        <div style={{marginBottom:24}}>
          <div style={{...n(theme,true),height:7,borderRadius:99}}>
            <div style={{height:"100%",borderRadius:99,background:role?.color,width:`${(answeredCount/12)*100}%`,transition:"width 1s ease",boxShadow:answeredCount>0?`0 0 10px ${role?.color}88`:"none"}}/>
          </div>
        </div>

        {loading?(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <Dots dark={theme.bg==="#0f0f0f"}/>
            <div style={{fontSize:13,color:theme.textSub,marginTop:14}}>Merlin está avaliando...</div>
          </div>
        ):score?(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
              <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                <span style={{fontSize:64,fontWeight:900,color:theme.text,letterSpacing:-3,lineHeight:1}}>{score.nota_geral}</span>
                <span style={{fontSize:20,color:theme.textMuted,fontWeight:300}}>/10</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <div style={{background:recColor,color:"#fff",padding:"11px 22px",borderRadius:32,fontWeight:900,fontSize:13,boxShadow:`0 0 20px ${recColor}55`}}>{score.recomendacao}</div>
                <div style={{fontSize:12,color:theme.textSub}}>
                  {score.tem_fogo?"🔥 Tem fogo":"❄️ Sem fogo"} · Fit: <strong>{score.fit_cultural}</strong>
                </div>
              </div>
            </div>
            <div style={{...n(theme,true),padding:16,borderRadius:14,marginBottom:16}}>
              <div style={{fontSize:13,color:theme.text,lineHeight:1.75}}>{score.resumo}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[
                {title:"Pontos Fortes",items:score.pontos_fortes,color:"#16a34a",sign:"+"},
                {title:"Pontos de Atenção",items:score.pontos_atencao,color:"#d97706",sign:"⚠"}
              ].map(({title,items,color,sign})=>(
                <div key={title} style={{...n(theme),padding:16,borderRadius:14}}>
                  <div style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{title}</div>
                  {(items||[]).map((p,i)=>(
                    <div key={i} style={{fontSize:12,color:theme.text,marginBottom:7,display:"flex",gap:7,lineHeight:1.4}}>
                      <span style={{color,fontWeight:800,flexShrink:0}}>{sign}</span>{p}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{background:theme.text,color:theme.bg,padding:18,borderRadius:14,fontSize:14,fontWeight:700,lineHeight:1.6,fontStyle:"italic",marginBottom:20}}>
              "{score.veredicto}"
            </div>
          </>
        ):(
          <div style={{color:theme.textSub,fontSize:14,textAlign:"center",padding:28}}>Não foi possível gerar avaliação.</div>
        )}

        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>{setExporting(true);triggerPrintExport(session,score);setTimeout(()=>setExporting(false),1000);}}
            disabled={loading||exporting}
            style={{flex:1,minWidth:140,padding:"13px 0",borderRadius:13,border:"none",background:loading||exporting?theme.border:theme.text,color:loading||exporting?theme.textMuted:theme.bg,fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:loading||exporting?"not-allowed":"pointer",transition:"all .2s"}}>
            {exporting?"Abrindo...":"🖨 Exportar PDF"}
          </button>
          <button onClick={onBack}
            style={{flex:1,minWidth:140,padding:"13px 0",borderRadius:13,border:"none",...n(theme,false,true),color:theme.textSub,fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            ← Voltar
          </button>
        </div>
        {!loading&&<div style={{marginTop:8,fontSize:11,color:theme.textMuted,textAlign:"center"}}>Nova aba abre → use Ctrl+P → Salvar como PDF</div>}
      </div>
    </div>
  );
}

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
function HistoryScreen({ onBack, onOpen, onDeleteAll, t: theme }) {
  const [history,setHistory]=useState(loadHistory);
  const [search,setSearch]=useState("");
  const filtered=history.filter(h=>{
    const role=ROLES.find(r=>r.id===h.roleId);
    const q=search.toLowerCase();
    return h.candidateName?.toLowerCase().includes(q)||role?.title?.toLowerCase().includes(q);
  });
  const deleteOne=(id,e)=>{e.stopPropagation();const u=history.filter(h=>h.id!==id);setHistory(u);saveHistory(u);};
  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"40px 16px 48px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,color:theme.text}}>Histórico</div>
          <div style={{fontSize:13,color:theme.textSub}}>{history.length} conversa{history.length!==1?"s":""}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {history.length>0&&(
            <button onClick={()=>{if(confirm("Apagar todo o histórico?")){{saveHistory([]);setHistory([]);onDeleteAll();}}}}
              style={{...n(theme,false,true),border:"none",padding:"8px 14px",fontFamily:"inherit",fontSize:12,color:"#e55",cursor:"pointer"}}>
              🗑 Apagar tudo
            </button>
          )}
          <button onClick={onBack} style={{...n(theme,false,true),border:"none",padding:"8px 14px",fontFamily:"inherit",fontSize:13,color:theme.textSub,cursor:"pointer"}}>← Voltar</button>
        </div>
      </div>
      {history.length>0&&(
        <div style={{...n(theme,true),padding:"10px 14px",borderRadius:12,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:theme.textMuted,fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome ou cargo..."
            style={{background:"none",border:"none",outline:"none",fontFamily:"inherit",fontSize:13,color:theme.text,flex:1}}/>
          {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:theme.textMuted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}
        </div>
      )}
      {filtered.length===0?(
        <div style={{...n(theme,true),padding:48,textAlign:"center",color:theme.textMuted,fontSize:14,borderRadius:16}}>
          {search?"Nenhum resultado.":"Nenhuma conversa salva ainda."}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[...filtered].reverse().map((h,i)=>{
            const role=ROLES.find(r=>r.id===h.roleId);
            const answered=Object.keys(h.answeredQ||{}).length;
            return (
              <div key={h.id} onClick={()=>onOpen(h)}
                style={{...n(theme),borderRadius:18,padding:"16px 18px",cursor:"pointer",animation:`fadeUp .3s ease ${i*40}ms both`,transition:"transform .2s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:11,minWidth:0}}>
                    <div style={{...n(theme,true),width:40,height:40,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{role?.icon}</div>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:800,fontSize:14,color:theme.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.candidateName}</div>
                      <div style={{fontSize:12,color:theme.textSub}}>{role?.title}{h.linkedin?` · ${h.linkedin}`:""}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0,marginLeft:12}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:theme.text}}>{answered}<span style={{color:theme.textMuted}}>/12</span></div>
                      <div style={{fontSize:10,color:theme.textMuted}}>{new Date(h.date).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <button onClick={e=>deleteOne(h.id,e)}
                      style={{background:"none",border:"none",cursor:"pointer",color:theme.textMuted,fontSize:18,padding:"2px 5px",borderRadius:6,lineHeight:1}}
                      onMouseEnter={e=>e.target.style.color="#e55"} onMouseLeave={e=>e.target.style.color=theme.textMuted}>×</button>
                  </div>
                </div>
                <div style={{...n(theme,true),height:4,borderRadius:99}}>
                  <div style={{height:"100%",borderRadius:99,background:role?.color,width:`${(answered/12)*100}%`,opacity:0.8}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── INTERVIEW SCREEN ─────────────────────────────────────────────────────────
function InterviewScreen({ session, onBack, onSummary, onSessionUpdate, t: theme, dark }) {
  const [messages,setMessages]=useState(session.messages||[]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [answeredQ,setAnsweredQ]=useState(session.answeredQ||{});
  const [answerInput,setAnswerInput]=useState("");
  const [activeQ,setActiveQ]=useState(null);
  const [notes,setNotes]=useState(session.notes||"");
  const [notesOpen,setNotesOpen]=useState(false);
  const [sideOpen,setSideOpen]=useState(true);
  const [isMobile,setIsMobile]=useState(window.innerWidth<700);
  const [mobileTab,setMobileTab]=useState("chat");
  const bottomRef=useRef(null);
  const inputRef=useRef(null);
  const role=ROLES.find(r=>r.id===session.roleId);
  const answeredCount=Object.keys(answeredQ).length;

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<700);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);

  const persist=useCallback((msgs,qs,nt)=>{
    const hist=loadHistory();
    const idx=hist.findIndex(h=>h.id===session.id);
    const updated={...session,messages:msgs,answeredQ:qs,notes:nt};
    if(idx>=0)hist[idx]=updated;else hist.push(updated);
    saveHistory(hist);
    onSessionUpdate(updated);
  },[session]);

  useEffect(()=>{persist(messages,answeredQ,notes);},[messages,answeredQ,notes]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const submitAnswer=async(qIndex,answer)=>{
    if(!answer.trim())return;
    const q=role.questions[qIndex];
    const userMsg=`Pergunta ${qIndex+1}: "${q}"\n\nO que a pessoa respondeu: "${answer}"`;
    const newMessages=[...messages,{role:"user",content:userMsg}];
    setMessages(newMessages);
    setAnsweredQ(prev=>({...prev,[qIndex]:answer}));
    setActiveQ(null);setAnswerInput("");setLoading(true);
    if(isMobile)setMobileTab("chat");
    try{
      const text=await callGroq(newMessages);
      setMessages(prev=>[...prev,{role:"assistant",content:text}]);
    }catch(e){
      setMessages(prev=>[...prev,{role:"assistant",content:`⚠️ Erro: ${e.message}`}]);
    }finally{setLoading(false);}
  };

  const sendChat=async(msg)=>{
    const text=(msg||input).trim();
    if(!text||loading)return;
    setInput("");
    const newMessages=[...messages,{role:"user",content:text}];
    setMessages(newMessages);setLoading(true);
    try{
      const reply=await callGroq(newMessages);
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(prev=>[...prev,{role:"assistant",content:`⚠️ Erro: ${e.message}`}]);
    }finally{setLoading(false);inputRef.current?.focus();}
  };

  const QuestionsList=()=>(
    <div style={{padding:isMobile?"12px 12px 80px":"14px 12px 14px 14px",overflowY:"auto",height:"100%"}}>
      <div style={{...n(theme,true),padding:12,marginBottom:12,borderRadius:13}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          <div style={{...n(theme),width:32,height:32,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{role.icon}</div>
          <div>
            <div style={{fontWeight:800,fontSize:13,color:theme.text}}>{session.candidateName}</div>
            <div style={{fontSize:10,color:theme.textSub}}>{role.title}</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:10,color:theme.textSub}}>Progresso</span>
          <span style={{fontSize:10,color:theme.textSub,fontWeight:700}}>{answeredCount}/12</span>
        </div>
        <div style={{...n(theme,true),height:5,borderRadius:99,marginBottom:10}}>
          <div style={{height:"100%",borderRadius:99,background:role.color,width:`${(answeredCount/12)*100}%`,transition:"width .6s ease",boxShadow:answeredCount>0?`0 0 8px ${role.color}88`:"none"}}/>
        </div>
        <div style={{fontSize:10,color:theme.textMuted,marginBottom:4,textTransform:"uppercase",letterSpacing:0.8}}>Avaliar</div>
        {role.evaluate.map((e,i)=>(
          <div key={i} style={{fontSize:11,color:theme.textSub,marginBottom:4,display:"flex",gap:6,alignItems:"flex-start",lineHeight:1.4}}>
            <div style={{width:3,height:3,borderRadius:"50%",background:role.color,marginTop:5,flexShrink:0}}/>{e}
          </div>
        ))}
      </div>

      <div style={{fontSize:10,color:theme.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:9}}>Perguntas</div>
      {role.questions.map((q,i)=>(
        <div key={i}
          onClick={()=>{if(answeredQ[i])return;setActiveQ(activeQ===i?null:i);setAnswerInput("");}}
          style={{background:theme.surface,borderRadius:11,padding:"11px 12px",marginBottom:7,cursor:answeredQ[i]?"default":"pointer",boxShadow:(answeredQ[i]||activeQ===i)?`inset 3px 3px 7px ${theme.s1}, inset -3px -3px 7px ${theme.s2}`:`3px 3px 7px ${theme.s1}, -3px -3px 7px ${theme.s2}`,transition:"box-shadow .2s"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <span style={{fontFamily:"monospace",fontSize:10,fontWeight:700,flexShrink:0,marginTop:2,color:answeredQ[i]?"#16a34a":activeQ===i?theme.text:theme.textMuted}}>
              {answeredQ[i]?"✓":String(i+1).padStart(2,"0")}
            </span>
            <span style={{fontSize:11,color:answeredQ[i]?theme.textMuted:theme.text,lineHeight:1.45,textDecoration:answeredQ[i]?"line-through":"none"}}>{q}</span>
          </div>
          {activeQ===i&&!answeredQ[i]&&(
            <div style={{marginTop:11}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:10,color:theme.textSub,marginBottom:5}}>O que a pessoa respondeu?</div>
              <textarea autoFocus value={answerInput} onChange={e=>setAnswerInput(e.target.value)}
                placeholder="Digita aqui a resposta dela..." rows={3}
                style={{...n(theme,true),borderRadius:9,padding:"9px 11px",color:theme.text,fontFamily:"inherit",fontSize:11,width:"100%",border:"none",outline:"none",resize:"vertical",lineHeight:1.4}}/>
              <button disabled={!answerInput.trim()||loading} onClick={()=>submitAnswer(i,answerInput)}
                style={{border:"none",borderRadius:9,padding:"8px 0",width:"100%",fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:answerInput.trim()&&!loading?"pointer":"not-allowed",marginTop:6,background:answerInput.trim()?theme.text:theme.border,color:answerInput.trim()?theme.bg:theme.textMuted,transition:"all .2s"}}>
                Analisar com Merlin →
              </button>
            </div>
          )}
          {answeredQ[i]&&(
            <div style={{marginTop:4,fontSize:10,color:theme.textMuted,fontStyle:"italic",paddingLeft:19,lineHeight:1.3}}>
              "{answeredQ[i].slice(0,50)}{answeredQ[i].length>50?"...":""}"
            </div>
          )}
        </div>
      ))}
      {answeredCount>=3&&(
        <button onClick={onSummary}
          style={{width:"100%",marginTop:8,padding:"11px 0",borderRadius:11,border:"none",background:theme.text,color:theme.bg,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          📊 Avaliação final
        </button>
      )}
    </div>
  );

  const ChatPanel=()=>(
    <>
      {/* Quick actions */}
      <div style={{padding:"10px 14px 4px",borderBottom:`1px solid ${theme.border}`,overflowX:"auto",display:"flex",gap:6,flexWrap:"nowrap",background:theme.bg}}>
        {QUICK_ACTIONS.map(({label,desc,msg})=>(
          <button key={msg} onClick={()=>sendChat(msg)} disabled={loading}
            title={desc}
            style={{...n(theme,false,true),border:"none",padding:"5px 11px",fontFamily:"inherit",fontSize:11,color:theme.textSub,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap",flexShrink:0,opacity:loading?0.4:1,transition:"all .15s"}}
            onMouseEnter={e=>{if(!loading)e.currentTarget.style.color=theme.text;}}
            onMouseLeave={e=>e.currentTarget.style.color=theme.textSub}>
            {label}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px"}}>
        {messages.map((msg,i)=>(
          <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:12,animation:"fadeUp .3s ease"}}>
            {msg.role==="assistant"&&(
              <div style={{...n(theme,false,true),width:28,height:28,borderRadius:8,flexShrink:0,marginRight:8,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Logo size={13} color={theme.text}/>
              </div>
            )}
            <div style={{maxWidth:"84%",padding:"10px 13px",fontSize:13,lineHeight:1.65,wordBreak:"break-word",
              ...(msg.role==="user"
                ?{background:theme.userBub,color:theme.userTxt,borderRadius:"16px 16px 4px 16px"}
                :{...n(theme),borderRadius:"4px 16px 16px 16px",color:theme.aiTxt})
            }} dangerouslySetInnerHTML={{__html:fmt(msg.content)}}/>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{...n(theme,false,true),width:28,height:28,borderRadius:8,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Logo size={13} color={theme.text}/>
            </div>
            <div style={{...n(theme),borderRadius:"4px 16px 16px 16px",padding:"10px 13px"}}>
              <Dots dark={dark}/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{padding:"8px 12px 14px",borderTop:`1px solid ${theme.border}`}}>
        <div style={{...n(theme,true),padding:"9px 12px",display:"flex",alignItems:"flex-end",gap:8,borderRadius:13}}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}}
            placeholder='Escreve o que aconteceu, ou use "?" para pedir orientação...' rows={1}
            style={{resize:"none",background:"none",border:"none",outline:"none",fontFamily:"inherit",fontSize:13,color:theme.text,flex:1,lineHeight:1.5,maxHeight:100}}
            onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}/>
          <button onClick={()=>sendChat()} disabled={!input.trim()||loading}
            style={{background:input.trim()&&!loading?theme.text:theme.border,border:"none",borderRadius:8,width:32,height:32,cursor:input.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div style={{textAlign:"center",fontSize:10,color:theme.textMuted,marginTop:5}}>Enter envia · Shift+Enter nova linha</div>
      </div>
    </>
  );

  // MOBILE
  if(isMobile){
    return(
      <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 60px)"}}>
        <div style={{display:"flex",borderBottom:`1px solid ${theme.border}`,background:theme.bg}}>
          {[["questions","📋 Perguntas"],["chat","💬 Merlin"],["notes","📝 Notas"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setMobileTab(tab)}
              style={{flex:1,padding:"10px 0",border:"none",background:"none",fontFamily:"inherit",fontSize:12,fontWeight:mobileTab===tab?700:400,color:mobileTab===tab?theme.text:theme.textSub,borderBottom:mobileTab===tab?`2px solid ${theme.text}`:"2px solid transparent",cursor:"pointer",transition:"all .15s"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {mobileTab==="questions"&&<div style={{flex:1,overflowY:"auto"}}><QuestionsList/></div>}
          {mobileTab==="chat"&&<ChatPanel/>}
          {mobileTab==="notes"&&(
            <div style={{flex:1,padding:14,display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:13,fontWeight:700,color:theme.text,marginBottom:10}}>📝 Suas notas</div>
              <div style={{...n(theme,true),flex:1,padding:12,borderRadius:13,display:"flex"}}>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                  placeholder="Anotações livres — impressões, dúvidas, o que observou..."
                  style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:"inherit",fontSize:13,color:theme.text,resize:"none",lineHeight:1.6}}/>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DESKTOP
  return(
    <div style={{display:"flex",height:"calc(100vh - 60px)",overflow:"hidden"}}>
      <div style={{width:sideOpen?295:0,minWidth:sideOpen?295:0,overflow:"hidden",borderRight:`1px solid ${theme.border}`,background:theme.bg,transition:"width .3s ease, min-width .3s ease",flexShrink:0,display:"flex",flexDirection:"column"}}>
        {sideOpen&&<QuestionsList/>}
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",background:theme.chatBg,minWidth:0}}>
        <div style={{padding:"7px 12px",borderBottom:`1px solid ${theme.border}`,display:"flex",alignItems:"center",gap:8,background:theme.bg}}>
          <button onClick={()=>setSideOpen(!sideOpen)}
            style={{...n(theme,false,true),border:"none",width:26,height:26,cursor:"pointer",color:theme.textSub,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {sideOpen?"◀":"▶"}
          </button>
          <span style={{fontSize:11,color:theme.textMuted,flex:1}}>{answeredCount}/12 respondidas</span>
          <button onClick={()=>setNotesOpen(!notesOpen)}
            style={{...n(theme,notesOpen,true),border:"none",padding:"4px 10px",fontFamily:"inherit",fontSize:11,color:notesOpen?theme.text:theme.textSub,cursor:"pointer"}}>
            📝 {notesOpen?"Fechar":"Notas"}
          </button>
        </div>
        <div style={{flex:1,display:"flex",minHeight:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
            <ChatPanel/>
          </div>
          {notesOpen&&(
            <div style={{width:220,borderLeft:`1px solid ${theme.border}`,display:"flex",flexDirection:"column",background:theme.bg,flexShrink:0}}>
              <div style={{padding:"10px 13px",borderBottom:`1px solid ${theme.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:theme.text}}>📝 Suas notas</div>
                <div style={{fontSize:10,color:theme.textMuted}}>Salvas automaticamente</div>
              </div>
              <div style={{flex:1,padding:11,display:"flex"}}>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                  placeholder="Impressões, dúvidas, observações..."
                  style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:"inherit",fontSize:12,color:theme.text,resize:"none",lineHeight:1.6}}/>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function TesseraktRecrutamento() {
  const [dark,setDark]=useState(()=>{try{return JSON.parse(localStorage.getItem("t_dark")||"false");}catch{return false;}});
  const [screen,setScreen]=useState("roles");
  const [selectedRole,setSelectedRole]=useState(null);
  const [activeSession,setActiveSession]=useState(null);
  const [history,setHistory]=useState(loadHistory);

  const theme=getTheme(dark);
  const toggleDark=()=>{const next=!dark;setDark(next);localStorage.setItem("t_dark",JSON.stringify(next));};

  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${theme.bg};overflow-x:hidden;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${theme.border};border-radius:2px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
    @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    input::placeholder,textarea::placeholder{color:${theme.textMuted};}
  `;

  const headerLabel={
    roles:null,candidate:selectedRole?.title,
    interview:activeSession?`${activeSession.candidateName} · ${ROLES.find(r=>r.id===activeSession?.roleId)?.title}`:"",
    summary:activeSession?`Avaliação · ${activeSession.candidateName}`:"",
    history:"Histórico"
  }[screen];

  return(
    <div style={{minHeight:"100vh",background:theme.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif",color:theme.text}}>
      <style>{CSS}</style>
      {/* HEADER */}
      <div style={{background:theme.bg,padding:"10px 16px",display:"flex",alignItems:"center",gap:11,position:"sticky",top:0,zIndex:100,borderBottom:`1px solid ${theme.border}`,height:60}}>
        <div style={{...n(theme,false,true),width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}} onClick={()=>setScreen("roles")}>
          <Logo size={18} color={theme.text}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:900,letterSpacing:-.5,color:theme.text,lineHeight:1}}>Tesserakt</div>
          <div style={{fontSize:10,color:theme.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>
            {headerLabel||"Seleção de Time Fundador"}
          </div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {screen==="interview"&&activeSession&&Object.keys(activeSession.answeredQ||{}).length>=3&&(
            <button onClick={()=>setScreen("summary")}
              style={{...n(theme,false,true),border:"none",padding:"5px 11px",fontFamily:"inherit",fontSize:11,fontWeight:700,color:theme.text,cursor:"pointer"}}>
              📊 Avaliar
            </button>
          )}
          <button onClick={toggleDark}
            style={{...n(theme,false,true),border:"none",width:30,height:30,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {dark?"☀️":"🌙"}
          </button>
          {screen!=="roles"&&(
            <button onClick={()=>{setHistory(loadHistory());setScreen("roles");}}
              style={{...n(theme,false,true),border:"none",padding:"5px 11px",fontFamily:"inherit",fontSize:12,color:theme.textSub,cursor:"pointer"}}>
              ← Início
            </button>
          )}
        </div>
      </div>

      {screen==="roles"&&<RolesScreen t={theme} onSelect={r=>{setSelectedRole(r);setScreen("candidate");}} onHistory={()=>setScreen("history")} historyCount={history.length}/>}
      {screen==="candidate"&&selectedRole&&(
        <CandidateScreen t={theme} role={selectedRole} onBack={()=>setScreen("roles")}
          onStart={({name,linkedin,obs})=>{
            const session={id:Date.now().toString(),candidateName:name,linkedin,obs,roleId:selectedRole.id,date:new Date().toISOString(),notes:"",
              messages:[{role:"assistant",content:`Perfeito. **${name}** quer entrar como ${selectedRole.title} ${selectedRole.icon}${obs?`\n\nContexto: ${obs}`:""}\n\nEstou aqui. Clica em qualquer pergunta, digita o que ela respondeu e eu analiso.\n\nOu me fala: "?" pra eu sugerir o que perguntar agora, "perfil" pra leitura completa, "convencer" pra saber como apresentar a Tesserakt pra ela.`}],
              answeredQ:{}};
            const hist=loadHistory();hist.push(session);saveHistory(hist);
            setHistory(loadHistory());setActiveSession(session);setScreen("interview");
          }}/>
      )}
      {screen==="interview"&&activeSession&&(
        <InterviewScreen t={theme} dark={dark} session={activeSession}
          onBack={()=>{setHistory(loadHistory());setScreen("roles");}}
          onSummary={()=>setScreen("summary")}
          onSessionUpdate={updated=>setActiveSession(updated)}/>
      )}
      {screen==="summary"&&activeSession&&(
        <SummaryScreen t={theme} session={activeSession} onBack={()=>setScreen("interview")}/>
      )}
      {screen==="history"&&(
        <HistoryScreen t={theme} onBack={()=>setScreen("roles")}
          onOpen={h=>{setActiveSession(h);setScreen("interview");}}
          onDeleteAll={()=>{setHistory([]);setScreen("roles");}}/>
      )}
    </div>
  );
}