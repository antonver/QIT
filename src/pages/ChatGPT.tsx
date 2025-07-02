import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = 'Ты — дружелюбный ассистент, помогай кратко и по-русски.';

const ChatGPT: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: SYSTEM_PROMPT },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    scrollBottom();

    try {
      setLoading(true);
      const { data } = await axios.post('/api/chat', {
        messages: newHistory,
      });
      const botMsg: ChatMessage = data;
      setMessages([...newHistory, botMsg]);
      scrollBottom();
    } catch (err) {
      console.error(err);
      setMessages([...newHistory, { role: 'assistant', content: '⚠️ Ошибка ответа от сервера' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 2, color: 'white', textAlign: 'center' }}>
        ChatGPT
      </Typography>

      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        <List>
          {messages.filter((m) => m.role !== 'system').map((m, idx) => (
            <ListItem key={idx} sx={{ display: 'block', whiteSpace: 'pre-line' }}>
              <Typography variant="subtitle2" color={m.role === 'user' ? 'primary.main' : 'secondary.main'}>
                {m.role === 'user' ? 'Вы:' : 'GPT:'}
              </Typography>
              <Typography variant="body1" color="text.primary">
                {m.content}
              </Typography>
            </ListItem>
          ))}
          {loading && (
            <ListItem>
              <CircularProgress size={24} />
            </ListItem>
          )}
          <div ref={bottomRef} />
        </List>
      </Box>

      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1, mr: 1 }}
          InputProps={{ sx: { color: 'white' } }}
        />
        <IconButton color="primary" onClick={handleSend} disabled={loading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatGPT; 