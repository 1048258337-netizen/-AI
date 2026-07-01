import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: 'ark-d0d2cedf-fec8-420c-8c4d-62967df9ee55-187e7',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  // 在对话最前面加入系统人设
  const systemPrompt = {
    role: 'system',
    content: '你是胡素瑜AI助手，由字节跳动火山方舟提供服务，回答简洁友好，不要自称DeepSeek。'
  };
  const fullMessages = [systemPrompt, ...messages];

  const stream = await openai.chat.completions.create({
    model: 'ep-20260701210405-86tpf',
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