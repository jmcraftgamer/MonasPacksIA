import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "MonaPacksIA",
  },
});

export async function POST(request: Request) {
  try {
    const { message, historico } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: `Você é a assistente IA do MonaPacksIA, um site que oferece uma biblioteca de packs para youtubers e editores de vídeo.

Você tem acesso aos seguintes produtos no site:
- Trilhas sonoras para jogos, vlogs, etc
- Memes em vídeo e imagem
- Efeitos sonoros
- Packs completos com vários tipos de mídia

Sua função é:
1. Recomendar packs e produtos baseados no que o usuário precisa
2. Montar combinações personalizadas de produtos
3. Ajudar o usuário a encontrar o que procura
4. Explicar os planos do site (Grátis: 3 downloads individuais | Premium: R$29,90/mês ilimitado)

Seja amigável, direta e use português brasileiro. Ajude o usuário a montar o pack perfeito para o projeto dele!`,
        },
        ...(historico || []),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    return NextResponse.json({ role: "assistant", content: reply });
  } catch (error: any) {
    console.error("Chat error:", error);
    const message = error?.error?.message || error?.message || "Erro desconhecido";
    return NextResponse.json(
      { role: "assistant", content: `Desculpe, ocorreu um erro: ${message}. Tente novamente mais tarde!` },
      { status: 200 }
    );
  }
}
