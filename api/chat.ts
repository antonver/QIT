import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Инициализация клиента OpenAI. Ключ берётся из переменной окружения OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model = 'gpt-3.5-turbo' } = req.body as {
      messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      model?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid "messages" payload' });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
    });

    const choice = completion.choices?.[0]?.message;
    if (!choice) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    return res.status(200).json(choice);
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'OpenAI request failed' });
  }
} 