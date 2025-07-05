import OpenAI from 'openai';

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Проверяем API ключ
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Добавьте OPENAI_API_KEY в переменные окружения Vercel'
      });
    }

    const { messages, model = 'gpt-3.5-turbo' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages payload' });
    }

    // Создаём OpenAI клиент
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('🤖 Отправляем запрос к OpenAI...');

    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const choice = completion.choices?.[0]?.message;
    if (!choice) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    console.log('✅ Ответ получен от OpenAI');
    return res.status(200).json(choice);
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'OpenAI request failed',
      details: error.message 
    });
  }
} 