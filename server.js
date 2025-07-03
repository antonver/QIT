import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Проверяем API ключ
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY не найден в переменных окружения!');
  console.log('💡 Добавьте OPENAI_API_KEY в .env файл или в переменные окружения');
}

// API endpoint для чата
app.post('/api/chat', async (req, res) => {
  try {
    // Проверяем API ключ
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Добавьте OPENAI_API_KEY в .env файл'
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
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📡 API доступен на http://localhost:${PORT}/api/chat`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Настроен' : '❌ Не настроен'}`);
}); 