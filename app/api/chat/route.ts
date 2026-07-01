import { OpenAI } from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  apiKey: process.env.ARK_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const modelId = process.env.ARK_EP_ID!;

  const stream = await openai.chat.completions.create({
    model: modelId,
    stream: true,
    messages,
  });

  return new Response(stream.toReadableStream(), {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}