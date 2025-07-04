import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  TextField,
  Alert,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { AeonChat, AeonChatList } from '../types/api';

interface ChatInfoDialogProps {
  open: boolean;
  onClose: () => void;
  currentChat: AeonChatList | null;
  loadChatInfo: (chatId: number) => Promise<AeonChat>;
  addMemberToChat: (chatId: number, userId: number) => Promise<void>;
  removeMemberFromChat: (chatId: number, userId: number) => Promise<void>;
  currentUserId?: number;
}

const ChatInfoDialog: React.FC<ChatInfoDialogProps> = ({
  open,
  onClose,
  currentChat,
  loadChatInfo,
  addMemberToChat,
  removeMemberFromChat,
  currentUserId,
}) => {
  const [chatInfo, setChatInfo] = useState<AeonChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    if (open && currentChat) {
      loadChatDetails();
    }
  }, [open, currentChat]);

  const loadChatDetails = async () => {
    if (!currentChat) return;
    
    try {
      setLoading(true);
      setError(null);
      const details = await loadChatInfo(currentChat.id);
      setChatInfo(details);
    } catch (err) {
      setError('Не удалось загрузить информацию о чате');
      console.error('Error loading chat details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim() || !currentChat) return;
    
    const memberId = parseInt(newMemberId.trim());
    if (isNaN(memberId)) {
      setError('Введите корректный ID пользователя');
      return;
    }

    try {
      setAddingMember(true);
      setError(null);
      await addMemberToChat(currentChat.id, memberId);
      setNewMemberId('');
      await loadChatDetails(); // Перезагружаем информацию о чате
    } catch (err) {
      setError('Не удалось добавить участника');
      console.error('Error adding member:', err);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!currentChat) return;

    try {
      setError(null);
      await removeMemberFromChat(currentChat.id, memberId);
      await loadChatDetails(); // Перезагружаем информацию о чате
    } catch (err) {
      setError('Не удалось удалить участника');
      console.error('Error removing member:', err);
    }
  };

  if (!currentChat) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(35, 43, 59, 0.95)',
          color: 'white',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={currentChat.photo_url || undefined}
          sx={{ bgcolor: '#4a9eff' }}
        >
          {currentChat.title ? currentChat.title[0].toUpperCase() : <PersonIcon />}
        </Avatar>
        <Box>
          <Typography variant="h6">{currentChat.title || 'Безымянный чат'}</Typography>
          <Typography variant="caption" sx={{ color: '#8b95a1' }}>
            {currentChat.chat_type === 'private' ? 'Личный чат' : 'Групповой чат'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress sx={{ color: '#4a9eff' }} />
          </Box>
        ) : chatInfo ? (
          <>
            {/* Информация о чате */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Информация
              </Typography>
              <Typography variant="body2" sx={{ color: '#8b95a1', mb: 1 }}>
                ID чата: {chatInfo.id}
              </Typography>
              <Typography variant="body2" sx={{ color: '#8b95a1', mb: 1 }}>
                Создан: {new Date(chatInfo.created_at).toLocaleDateString('ru-RU')}
              </Typography>
              {chatInfo.description && (
                <Typography variant="body2" sx={{ color: '#8b95a1' }}>
                  Описание: {chatInfo.description}
                </Typography>
              )}
            </Box>

            {/* Участники */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Участники ({chatInfo.members?.length || 0})
              </Typography>
              
              {chatInfo.members && chatInfo.members.length > 0 ? (
                <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {chatInfo.members.map((member) => (
                    <ListItem
                      key={member.id}
                      sx={{
                        bgcolor: 'rgba(43, 52, 65, 0.5)',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={member.profile_photo_url || undefined}
                          sx={{ bgcolor: '#4a9eff' }}
                        >
                          {member.first_name ? member.first_name[0].toUpperCase() : <PersonIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>
                              {member.first_name} {member.last_name}
                            </Typography>
                            {member.is_admin && (
                              <Chip
                                icon={<AdminIcon />}
                                label="Админ"
                                size="small"
                                sx={{
                                  bgcolor: '#4a9eff',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#8b95a1' }}>
                            {member.username ? `@${member.username}` : `ID: ${member.telegram_id}`}
                          </Typography>
                        }
                      />
                      {currentUserId !== member.telegram_id && (
                        <Tooltip title="Удалить участника">
                          <IconButton
                            onClick={() => handleRemoveMember(member.telegram_id)}
                            sx={{
                              color: '#f44336',
                              '&:hover': {
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                              },
                            }}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: '#8b95a1', textAlign: 'center', py: 2 }}>
                  Нет участников
                </Typography>
              )}
            </Box>

            {/* Добавление участника */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Добавить участника
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Telegram ID пользователя"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4a9eff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a9eff',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disabled={!newMemberId.trim() || addingMember}
                  startIcon={addingMember ? <CircularProgress size={16} /> : <PersonAddIcon />}
                  sx={{
                    bgcolor: '#4a9eff',
                    '&:hover': {
                      bgcolor: '#3d8bdb',
                    },
                  }}
                >
                  Добавить
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Typography variant="body2" sx={{ textAlign: 'center', py: 3, color: '#8b95a1' }}>
            Не удалось загрузить информацию о чате
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#8b95a1' }}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatInfoDialog; 