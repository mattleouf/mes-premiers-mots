import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handler(event) {
  const { prompt } = JSON.parse(event.body || "{}");
  const completion = await openai.chat.completions.create({
    model: "codex-1",              // coding-optimised version of o3
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ code: completion.choices[0].message.content })
  };
}
