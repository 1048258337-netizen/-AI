import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.ARK_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const systemPrompt = {
    role: 'system',
    content: '你是胡素瑜AI助手，由字节跳动火山方舟提供服务，回答简洁友好。'
  };
  const fullMessages = [systemPrompt, ...messages];

  const stream = await openai.chat.completions.create({
    model: process.env.ARK_EP_ID,
    stream: true,
    messages: fullMessages
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async pull(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });

  return new NextResponse(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
