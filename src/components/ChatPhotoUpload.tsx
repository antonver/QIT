import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { uploadMedia } from '../services/aeonMessengerApi';

interface ChatPhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string | null) => void;
  disabled?: boolean;
  size?: number;
}

export const ChatPhotoUpload: React.FC<ChatPhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange,
  disabled = false,
  size = 80,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    // Показываем предварительный просмотр
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Загружаем файл
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      console.log('Загружаем файл:', file.name, file.size, file.type);
      const response = await uploadMedia(file);
      
      // Обновляем URL фото
      onPhotoChange(response.media_url);
      setPreviewUrl(response.media_url);
      
      console.log('Фото успешно загружено:', response.media_url);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      
      let errorMessage = 'Ошибка загрузки фото';
      
      // Более детальная обработка ошибок
      if (err.response?.status === 405) {
        errorMessage = 'Загрузка фото временно недоступна';
        console.warn('405 Error: uploadMedia endpoint may not be available');
      } else if (err.response?.status === 413) {
        errorMessage = 'Файл слишком большой';
      } else if (err.response?.status === 422) {
        errorMessage = 'Неподдерживаемый формат файла';
      } else if (err.response?.status === 401) {
        errorMessage = 'Ошибка авторизации';
      } else if (err.isAuthError) {
        errorMessage = 'Требуется авторизация в Telegram';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Превышено время ожидания';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Ошибка сервера, попробуйте позже';
      }
      
      setError(errorMessage);
      
      // Возвращаем предыдущий URL
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
    setError(null);
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={previewUrl || undefined}
          sx={{
            width: size,
            height: size,
            bgcolor: '#4a9eff',
            cursor: disabled || uploading ? 'default' : 'pointer',
            border: error ? '2px solid #f44336' : '2px solid transparent',
            '&:hover': {
              opacity: disabled || uploading ? 1 : 0.8,
            },
          }}
          onClick={handleClick}
        >
          {uploading ? (
            <CircularProgress size={size * 0.4} sx={{ color: 'white' }} />
          ) : (
            <PhotoCameraIcon sx={{ fontSize: size * 0.4 }} />
          )}
        </Avatar>

        {/* Кнопка удаления фото */}
        {previewUrl && !uploading && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: '#f44336',
              color: 'white',
              width: 24,
              height: 24,
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
            onClick={handleDeletePhoto}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}

        {/* Индикатор загрузки */}
        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
            }}
          >
            <CircularProgress size={size * 0.3} sx={{ color: 'white' }} />
          </Box>
        )}
      </Box>

      {/* Кнопки действий */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CloudUploadIcon />}
          onClick={handleClick}
          disabled={disabled || uploading}
          sx={{
            borderColor: '#4a9eff',
            color: '#4a9eff',
            '&:hover': {
              borderColor: '#3d8bdb',
              bgcolor: 'rgba(74, 158, 255, 0.1)',
            },
          }}
        >
          {uploading ? 'Загрузка...' : 'Выбрать фото'}
        </Button>

        {previewUrl && (
          <Tooltip title="Удалить фото">
            <IconButton
              size="small"
              onClick={handleDeletePhoto}
              disabled={disabled || uploading}
              sx={{
                color: '#f44336',
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Подсказка */}
      <Typography variant="caption" sx={{ color: '#8b95a1', textAlign: 'center' }}>
        Нажмите на аватар или кнопку для выбора фото
        <br />
        Максимальный размер: 5MB
        {error && (
          <>
            <br />
            <span style={{ color: '#f44336' }}>
              {error}
            </span>
            <br />
            <span style={{ color: '#8b95a1' }}>
              Чат можно создать и без фото
            </span>
          </>
        )}
      </Typography>

      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </Box>
  );
}; 