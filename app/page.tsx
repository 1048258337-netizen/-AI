'use client';
import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMsgList = [...messages, userMsg];
    setMessages(newMsgList);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgList })
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        setMessages(prev => {
          const arr = [...prev];
          arr[arr.length - 1].content = aiContent;
          return arr;
        });
      }
    } catch (err) {
      console.error('请求失败：', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">我是王浩儒，请问有什么可以帮到你~</h1>
      <div className="h-[65vh] overflow-y-auto mb-6 border p-4 rounded">
        {messages.map((item, idx) => (
          <div key={idx} className="mb-4">
            <span className="font-semibold">{item.role === 'user' ? '你' : 'AI'}：</span>
            <p>{item.content}</p>
          </div>
        ))}
        {loading && <p className="opacity-60">AI正在思考...</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 px-4 py-2 border rounded"
        />
        <button type="submit" disabled={loading} className="px-6 py-2 bg-black text-white rounded disabled:opacity-50">
          {loading ? '回复中' : '发送'}
        </button>
      </form>
    </div>
  );
}
