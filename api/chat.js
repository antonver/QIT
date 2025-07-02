import OpenAI from 'openai';

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверяем API ключ (теперь без VITE_ префикса!)
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { messages, model = 'gpt-3.5-turbo' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages payload' });
    }

    // Создаём OpenAI клиент с серверным ключом
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ключ скрыт на сервере
    });

    const completion = await openai.chat.completions.create({
      model,
      messages,
    });

    const choice = completion.choices?.[0]?.message;
    if (!choice) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    return res.status(200).json(choice);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'OpenAI request failed' });
  }
} 