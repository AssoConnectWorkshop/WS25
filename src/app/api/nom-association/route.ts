import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const client = new Anthropic();

export async function POST(request: Request) {
  const { domaine, valeurs, style, localisation } = await request.json();

  const prompt = `Tu es un expert en communication et naming pour les associations françaises (loi 1901).

L'utilisateur souhaite créer une association avec les caractéristiques suivantes :
- Domaine / thématique : ${domaine || "non précisé"}
- Valeurs ou mots-clés : ${valeurs || "non précisé"}
- Style souhaité : ${style || "non précisé"}
- Localisation (optionnel) : ${localisation || "non précisé"}

Propose 5 noms originaux et mémorables pour cette association. Pour chaque nom :
1. Donne le nom en gras
2. Explique brièvement (1-2 phrases) pourquoi ce nom est pertinent et ce qu'il évoque

Les noms doivent être :
- Faciles à prononcer et mémoriser
- Adaptés au contexte associatif français
- Originaux et distinctifs
- Éventuellement jouant sur des mots, acronymes ou métaphores si pertinent

Présente ta réponse de façon claire et structurée.`;

  const stream = await client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
