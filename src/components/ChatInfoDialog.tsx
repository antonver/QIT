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
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import type { AeonChat, AeonChatList } from '../types/api';
import { inviteMemberByUsername } from '../services/aeonMessengerApi';
import { ChatPhotoUpload } from './ChatPhotoUpload';

interface ChatInfoDialogProps {
  open: boolean;
  onClose: () => void;
  currentChat: AeonChatList | null;
  loadChatInfo: (chatId: number) => Promise<AeonChat>;
  addMemberToChat: (chatId: number, userId: number) => Promise<void>;
  removeMemberFromChat: (chatId: number, userId: number) => Promise<void>;
  currentUserId?: number;
  onChatPhotoUpdate?: (newPhotoUrl: string) => void;
}

const ChatInfoDialog: React.FC<ChatInfoDialogProps> = ({
  open,
  onClose,
  currentChat,
  loadChatInfo,
  addMemberToChat,
  removeMemberFromChat,
  currentUserId,
  onChatPhotoUpdate,
}) => {
  const [chatInfo, setChatInfo] = useState<AeonChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [addMode, setAddMode] = useState<'id' | 'username'>('username');
  const [addingMember, setAddingMember] = useState(false);
  const [addResult, setAddResult] = useState<{type: 'success' | 'info' | 'warning', message: string} | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

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

  // --- Универсальная логика добавления участника ---
  const tryAddMemberById = async (memberId: number) => {
    if (!currentChat) return;
    await addMemberToChat(currentChat.id, memberId);
  };

  const tryAddMemberByUsername = async (username: string) => {
    if (!currentChat) return;
    const result = await inviteMemberByUsername(currentChat.id, username);
    
    // Показываем результат для автоопределения
    if (result.status === 'added') {
      setAddResult({
        type: 'success',
        message: `✅ @${username} найден и добавлен в чат!`
      });
    } else if (result.status === 'invited') {
      setAddResult({
        type: 'info',
        message: `📨 @${username} не найден в базе. Приглашение создано - пользователь будет добавлен при входе в приложение.`
      });
    }
    
    // Очищаем результат через 5 секунд
    setTimeout(() => setAddResult(null), 5000);
  };

  // Добавление участника в режиме "ID". Если введён не-числовой текст – пробуем как username.
  const handleAddMember = async () => {
    if (!newMemberId.trim()) return;

    const input = newMemberId.trim();
    const parsed = parseInt(input);

    try {
      setAddingMember(true);
      setError(null);

      if (!isNaN(parsed)) {
        // Число – добавляем по ID
        await tryAddMemberById(parsed);
      } else {
        // Не число – считаем, что это username
        await tryAddMemberByUsername(input.replace(/^@/, ''));
      }

      // Очистка поля и перезагрузка данных
      setNewMemberId('');
      await loadChatDetails();
    } catch (err) {
      console.error('Error adding member (ID path):', err);
      setError('Не удалось добавить участника');
    } finally {
      setAddingMember(false);
    }
  };

  const handleAddMemberByUsername = async () => {
    if (!newMemberUsername.trim() || !currentChat) return;
    
    try {
      setAddingMember(true);
      setError(null);
      setAddResult(null);
      
      const result = await inviteMemberByUsername(currentChat.id, newMemberUsername.trim());
      
      // Показываем результат в зависимости от статуса
      if (result.status === 'added') {
        setAddResult({
          type: 'success',
          message: `✅ @${newMemberUsername.trim()} добавлен в чат!`
        });
        setNewMemberUsername('');
        await loadChatDetails(); // Перезагружаем информацию о чате
      } else if (result.status === 'invited') {
        setAddResult({
          type: 'info', 
          message: `📨 Приглашение отправлено @${newMemberUsername.trim()}. Пользователь будет добавлен автоматически при входе в приложение.`
        });
        setNewMemberUsername('');
      }
      
      // Очищаем результат через 5 секунд
      setTimeout(() => setAddResult(null), 5000);
    } catch (err) {
      console.error('Error adding member by username:', err);
      setAddResult({
        type: 'warning',
        message: 'Не удалось добавить участника. Проверьте username и попробуйте снова.'
      });
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

  const handlePhotoUpdate = (newPhotoUrl: string) => {
    // Обновляем локальную информацию о чате
    if (chatInfo) {
      setChatInfo({ ...chatInfo, photo_url: newPhotoUrl });
    }
    // Уведомляем родительский компонент
    if (onChatPhotoUpdate) {
      onChatPhotoUpdate(newPhotoUrl);
    }
    setShowPhotoUpload(false);
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
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={chatInfo?.photo_url || currentChat.photo_url || undefined}
            sx={{ bgcolor: '#4a9eff', width: 64, height: 64 }}
          >
            {currentChat.title ? currentChat.title[0].toUpperCase() : <PersonIcon />}
          </Avatar>
          <IconButton
            onClick={() => setShowPhotoUpload(true)}
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: '#4a9eff',
              color: 'white',
              width: 24,
              height: 24,
              '&:hover': {
                bgcolor: '#3d8bdb',
              },
            }}
          >
            <CameraIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
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
              
              {/* Результат добавления */}
              {addResult && (
                <Alert 
                  severity={addResult.type === 'success' ? 'success' : addResult.type === 'info' ? 'info' : 'warning'} 
                  sx={{ 
                    mb: 2,
                    '& .MuiAlert-message': {
                      color: 'white',
                    },
                    bgcolor: addResult.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 
                             addResult.type === 'info' ? 'rgba(33, 150, 243, 0.2)' : 
                             'rgba(255, 152, 0, 0.2)',
                    border: `1px solid ${addResult.type === 'success' ? '#4CAF50' : 
                                         addResult.type === 'info' ? '#2196F3' : 
                                         '#FF9800'}`,
                  }}
                >
                  {addResult.message}
                </Alert>
              )}

              {/* Переключатель режима */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant={addMode === 'username' ? 'contained' : 'outlined'}
                  onClick={() => setAddMode('username')}
                  size="small"
                  sx={{
                    bgcolor: addMode === 'username' ? '#4a9eff' : 'transparent',
                    color: addMode === 'username' ? 'white' : '#4a9eff',
                    borderColor: '#4a9eff',
                    '&:hover': {
                      bgcolor: addMode === 'username' ? '#3d8bdb' : 'rgba(74, 158, 255, 0.1)',
                    },
                  }}
                >
                  По @username
                </Button>
                <Button
                  variant={addMode === 'id' ? 'contained' : 'outlined'}
                  onClick={() => setAddMode('id')}
                  size="small"
                  sx={{
                    bgcolor: addMode === 'id' ? '#4a9eff' : 'transparent',
                    color: addMode === 'id' ? 'white' : '#4a9eff',
                    borderColor: '#4a9eff',
                    '&:hover': {
                      bgcolor: addMode === 'id' ? '#3d8bdb' : 'rgba(74, 158, 255, 0.1)',
                    },
                  }}
                >
                  По ID (авто)
                </Button>
              </Box>
              
              {addMode === 'username' ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="@username пользователя"
                    value={newMemberUsername}
                    onChange={(e) => setNewMemberUsername(e.target.value)}
                    helperText="💡 Если пользователь уже использовал приложение - добавится сразу. Если нет - получит приглашение."
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover fieldset': { borderColor: '#4a9eff' },
                        '&.Mui-focused fieldset': { borderColor: '#4a9eff' },
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddMemberByUsername}
                    disabled={!newMemberUsername.trim() || addingMember}
                    startIcon={addingMember ? <CircularProgress size={16} /> : <PersonAddIcon />}
                    sx={{
                      bgcolor: '#4a9eff',
                      '&:hover': { bgcolor: '#3d8bdb' },
                      minWidth: '120px',
                    }}
                  >
                    {addingMember ? 'Поиск...' : 'Добавить'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="ID или @username"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    helperText="💡 Можете ввести как Telegram ID (числа), так и @username - система определит автоматически"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                        '&:hover fieldset': { borderColor: '#4a9eff' },
                        '&.Mui-focused fieldset': { borderColor: '#4a9eff' },
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
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
                      '&:hover': { bgcolor: '#3d8bdb' },
                      minWidth: '120px',
                    }}
                  >
                    {addingMember ? 'Поиск...' : 'Добавить'}
                  </Button>
                </Box>
              )}
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

      {/* Диалог загрузки фото */}
      <Dialog
        open={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(35, 43, 59, 0.95)',
            color: 'white',
          },
        }}
      >
        <DialogTitle>
          Изменить фото чата
        </DialogTitle>
        <DialogContent>
          <ChatPhotoUpload
            currentPhotoUrl={chatInfo?.photo_url || currentChat.photo_url || undefined}
            onPhotoChange={(photoUrl) => {
              if (photoUrl) {
                handlePhotoUpdate(photoUrl);
              } else {
                // Если фото удалили, обновляем
                if (chatInfo) {
                  setChatInfo({ ...chatInfo, photo_url: undefined });
                }
                if (onChatPhotoUpdate) {
                  onChatPhotoUpdate('');
                }
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setShowPhotoUpload(false)} sx={{ color: '#8b95a1' }}>
              Отмена
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ChatInfoDialog; 