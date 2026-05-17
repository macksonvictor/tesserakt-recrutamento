from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import weasyprint
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ROLES = {
    "cto": {"title": "CTO / Braço Direito", "icon": "⚡", "color": "#f59e0b",
        "questions": ["Me conta de um projeto que você construiu do zero — não um curso, algo real que você fez.","Você já teve uma ideia que as pessoas ao redor acharam boa mas você sabia que era errada. O que você fez?","Se eu te disser que não vou te pagar agora mas você vai ter participação no que a gente construir — o que você pensa?","Me fala de uma vez que você falhou tecnicamente e o que isso te ensinou sobre você mesmo.","Como você age quando está num projeto e percebe que a direção está errada?","O que você faria nas próximas 2 semanas se entrasse hoje no time?","Você consegue trabalhar sem estrutura, sem processo definido, sem chefe? Me dá um exemplo.","O que te faz levantar de manhã — de verdade, não a resposta bonita.","Se você pudesse escolher qualquer pessoa no mundo para construir algo junto, quem seria e por quê?","Qual é a coisa que você construiu que mais te orgulha? Me explica o porquê.","Você já convenceu alguém a acreditar em algo que parecia impossível? Como foi?","O que você acha que eu deveria estar te perguntando e não estou?"]},
    "ai": {"title": "Dev IA / ML", "icon": "🧠", "color": "#8b5cf6",
        "questions": ["Me mostra algo que você construiu com IA por conta própria — código, projeto, experimento real.","Qual foi a ideia mais maluca que você teve com IA? Chegou a tentar?","Se você tivesse 30 dias e acesso a qualquer API, o que você construiria?","Quando faz sentido usar uma API pronta versus treinar seu próprio modelo?","Me explica o que é overfitting como se eu tivesse 14 anos.","Você já trabalhou com dados ruins ou incompletos? Como resolveu?","O que te frustra mais no estado atual da IA?","Qual tecnologia de IA você acha que está superestimada agora? Por quê?","Como você saberia que um modelo que você fez está funcionando de verdade em produção?","O que te fez se interessar por IA — de verdade, não a resposta de LinkedIn.","Você conseguiria construir algo útil com IA em uma semana sozinho? O quê?","O que você acha que eu deveria estar te perguntando e não estou?"]},
    "fullstack": {"title": "Dev Full Stack", "icon": "💻", "color": "#10b981",
        "questions": ["Me mostra um projeto seu que está no ar — não importa o tamanho, quero ver algo real.","Qual foi o bug mais difícil que você já resolveu? Como chegou na solução?","Você já construiu algo do zero sem tutorial? Me conta.","Se eu te der uma ideia hoje, em quanto tempo você consegue ter algo funcionando?","O que você faz quando trava num problema por mais de 2 horas?","Me explica autenticação de usuário como se eu não soubesse nada de programação.","Qual stack você usaria hoje para construir um app mobile rápido e por quê?","Você prefere trabalhar sozinho ou em duo? Por quê?","O que você faria diferente num projeto que já fez se pudesse refazer?","O que te faz gostar de programar — de verdade?","Você já ensinou programação pra alguém? Como foi?","O que você acha que eu deveria estar te perguntando e não estou?"]},
    "robotics": {"title": "Dev Robótica", "icon": "🤖", "color": "#3b82f6",
        "questions": ["Me mostra foto ou vídeo de algo físico que você já construiu com tecnologia.","Qual foi o momento mais frustrante de um projeto de hardware? Como resolveu?","Você consegue comprar componente errado e ainda fazer funcionar? Me dá um exemplo.","Me explica a diferença entre Arduino e Raspberry Pi como se eu fosse tomar uma decisão agora.","Você já teve um componente falhando de forma intermitente? Como diagnosticou?","O que te atrai na robótica que software puro não te daria?","Se você tivesse R$500 e 30 dias, o que construiria?","Como você conectaria um sensor físico a um app em tempo real?","O que você faria diferente num projeto de hardware que já fez?","Qual é o maior mito sobre robótica que você ouve frequentemente?","Você consegue ensinar eletrônica básica pra alguém em 5 minutos? Me ensina agora.","O que você acha que eu deveria estar te perguntando e não estou?"]},
    "designer": {"title": "Designer UI/UX", "icon": "🎨", "color": "#ec4899",
        "questions": ["Me mostra algo do seu portfolio e me explica cada decisão de design que tomou.","Qual foi o design que você mais se orgulha e por quê?","Me fala de um design que você fez e que não funcionou. O que aprendeu?","Como você convenceria alguém que não entende de design a confiar na sua visão?","O que você faria se o fundador pedisse algo que você sabe que vai prejudicar a experiência?","Você já validou um design com usuários reais? Como foi o processo?","Me explica design system com suas próprias palavras.","O que muda quando você projeta para mobile versus desktop?","Qual app ou produto você acha que tem o melhor design hoje? Por quê?","O que te irrita mais em interfaces mal feitas?","Você consegue criar uma identidade visual do zero em uma semana? Como abordaria?","O que você acha que eu deveria estar te perguntando e não estou?"]},
    "growth": {"title": "Growth / Marketing", "icon": "📈", "color": "#f97316",
        "questions": ["Me mostra algo que você fez crescer — comunidade, conta, projeto, qualquer coisa com número real.","Como você conseguiria as primeiras 100 pessoas certas para um movimento novo sem gastar nada?","Qual foi a ação de marketing mais criativa que você já executou?","Me explica o que é CAC e LTV como se eu fosse um dev que nunca ouviu falar.","Você já criou conteúdo que viralizou ou chegou perto? O que aconteceu?","O que você faria nos primeiros 30 dias aqui para gerar tração?","Qual rede social você acha que está sendo ignorada por todo mundo agora?","Como você diferenciaria uma startup de tecnologia jovem no mercado hoje?","O que é mais difícil: atrair pessoas novas ou manter as que já estão?","Você já construiu uma comunidade — online ou offline? Como foi?","O que te move no marketing — de verdade, sem resposta bonita?","O que você acha que eu deveria estar te perguntando e não estou?"]}
}

class ScoreData(BaseModel):
    nota_geral: Optional[float] = None
    recomendacao: Optional[str] = None
    resumo: Optional[str] = None
    tem_fogo: Optional[bool] = None
    pontos_fortes: Optional[list] = None
    pontos_atencao: Optional[list] = None
    fit_cultural: Optional[str] = None
    veredicto: Optional[str] = None

class PDFRequest(BaseModel):
    session: dict
    score: Optional[dict] = None

def build_html(session: dict, score: Optional[dict]) -> str:
    role_id = session.get("roleId", "")
    role = ROLES.get(role_id, {"title": role_id, "icon": "", "color": "#111", "questions": []})
    candidate_name = session.get("candidateName", "")
    linkedin = session.get("linkedin", "")
    notes = session.get("notes", "")
    date_str = session.get("date", "")
    answered_q = session.get("answeredQ", {})
    messages = session.get("messages", [])

    try:
        from datetime import datetime
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        date_fmt = dt.strftime("%d/%m/%Y")
    except:
        date_fmt = date_str

    answered_count = len(answered_q)

    rec_color = "#16a34a" if score and score.get("recomendacao") == "ENTRAR NO TIME" \
        else "#d97706" if score and score.get("recomendacao") == "CONVERSAR MAIS" \
        else "#dc2626"

    answers_html = ""
    for i_str, ans in answered_q.items():
        i = int(i_str)
        questions = role.get("questions", [])
        q = questions[i] if i < len(questions) else f"Pergunta {i+1}"

        ai_text = ""
        for j, msg in enumerate(messages):
            if msg.get("role") == "user" and q in msg.get("content", ""):
                if j + 1 < len(messages):
                    ai_content = messages[j + 1].get("content", "")
                    ai_text = ai_content[:400] + ("..." if len(ai_content) > 400 else "")
                break

        ai_block = f"""
        <div style="font-size:12px;color:#555;background:#fff;border:1px solid #e5e5e5;
                    border-radius:8px;padding:10px 12px;line-height:1.5;margin-top:8px;">
            <strong>Merlin:</strong> {ai_text}
        </div>""" if ai_text else ""

        answers_html += f"""
        <div style="margin-bottom:20px;padding:16px;background:#fafafa;border-radius:10px;
                    border-left:3px solid #111;page-break-inside:avoid;">
            <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;
                        letter-spacing:1px;margin-bottom:5px;">Pergunta {i+1}</div>
            <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:8px;">{q}</div>
            <div style="font-size:13px;color:#333;line-height:1.6;">{ans}</div>
            {ai_block}
        </div>"""

    score_html = ""
    if score:
        nota = score.get("nota_geral", "--")
        rec = score.get("recomendacao", "")
        resumo = score.get("resumo", "")
        tem_fogo = "🔥 Sim" if score.get("tem_fogo") else "❄️ Não"
        fit = score.get("fit_cultural", "")
        veredicto = score.get("veredicto", "")

        fortes = "".join([f'<div style="font-size:12px;color:#333;margin-bottom:6px;display:flex;gap:6px;"><span style="color:#16a34a;font-weight:800;">+</span>{p}</div>' for p in (score.get("pontos_fortes") or [])])
        atencao = "".join([f'<div style="font-size:12px;color:#333;margin-bottom:6px;display:flex;gap:6px;"><span style="color:#d97706;font-weight:800;">⚠</span>{p}</div>' for p in (score.get("pontos_atencao") or [])])

        score_html = f"""
        <div style="background:#f5f5f5;border-radius:16px;padding:24px;margin:24px 0;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:14px;">
                Avaliação Final — Merlin
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <div>
                    <span style="font-size:58px;font-weight:900;letter-spacing:-3px;line-height:1;">{nota}</span>
                    <span style="font-size:20px;color:#888;"> / 10</span>
                </div>
                <div style="text-align:right;">
                    <div style="background:{rec_color};color:#fff;padding:10px 22px;border-radius:30px;font-weight:900;font-size:13px;display:inline-block;">
                        {rec}
                    </div>
                    <div style="font-size:12px;color:#888;margin-top:6px;">Fogo: {tem_fogo} · Fit: {fit}</div>
                </div>
            </div>
            <div style="font-size:14px;color:#333;line-height:1.7;margin-bottom:14px;">{resumo}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;">
                <div>
                    <div style="font-size:10px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Pontos Fortes</div>
                    {fortes}
                </div>
                <div>
                    <div style="font-size:10px;font-weight:800;color:#d97706;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Pontos de Atenção</div>
                    {atencao}
                </div>
            </div>
            <div style="background:#111;color:#fff;border-radius:12px;padding:14px 18px;font-size:14px;font-weight:700;font-style:italic;">
                "{veredicto}"
            </div>
        </div>"""

    notes_html = f"""
    <div style="background:#fffbeb;border-radius:10px;padding:14px;border:1px solid #fde68a;margin-bottom:20px;">
        <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📝 Suas Notas</div>
        <div style="font-size:13px;color:#78350f;white-space:pre-wrap;">{notes}</div>
    </div>""" if notes else ""

    linkedin_html = f'<span style="font-size:12px;color:#888;">🔗 {linkedin}</span>' if linkedin else ""

    progress_pct = int((answered_count / 12) * 100)

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 48px; font-size: 14px; line-height: 1.6; }}
    h1 {{ font-size: 30px; font-weight: 900; letter-spacing: -1px; margin-bottom: 6px; }}
    .badge {{ display: inline-block; background: #111; color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }}
    .section-title {{ font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin: 28px 0 14px; }}
    .progress-bar {{ background: #e8e8e8; border-radius: 99px; height: 6px; margin: 12px 0 24px; }}
    .progress-fill {{ background: {role['color']}; border-radius: 99px; height: 6px; width: {progress_pct}%; }}
</style>
</head>
<body>

<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:20px;margin-bottom:28px;">
    <div>
        <div style="font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#888;">Tesserakt · Seleção de Time</div>
        <div style="font-size:11px;color:#aaa;margin-top:4px;">{date_fmt}</div>
    </div>
    <div style="font-size:11px;color:#888;text-align:right;">{answered_count}/12 perguntas respondidas</div>
</div>

<h1>{candidate_name}</h1>
<div style="margin:10px 0 8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
    <span class="badge">{role['icon']} {role['title']}</span>
    {linkedin_html}
</div>

<div class="progress-bar"><div class="progress-fill"></div></div>

{score_html}
{notes_html}

<div class="section-title">Respostas da Conversa</div>
{answers_html}

<div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:11px;color:#aaa;text-align:center;">
    Tesserakt · Seleção de Time Fundador · {date_fmt}
</div>

</body>
</html>"""


@app.post("/gerar-pdf")
async def gerar_pdf(req: PDFRequest):
    html = build_html(req.session, req.score)
    pdf_bytes = weasyprint.HTML(string=html).write_pdf()
    candidate_name = req.session.get("candidateName", "candidato").lower().replace(" ", "-")
    filename = f"tesserakt-{candidate_name}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.get("/")
def root():
    return {"status": "Tesserakt PDF API rodando"}
