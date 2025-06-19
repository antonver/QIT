import React from 'react';
import { TextField, IconButton } from '@mui/material';
import FilePresentIcon from '@mui/icons-material/FilePresent';

interface ChatBarProps {
    onAttachmentClick: () => void;
}

const ChatBar: React.FC<ChatBarProps> = ({ onAttachmentClick }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', backgroundColor: '#1e2a44', padding: '8px', borderRadius: '20px' }}>
            <TextField
                variant="standard"
                placeholder="Сообщение"
                fullWidth
                InputProps={{ disableUnderline: true, style: { color: '#fff', fontSize: '16px' } }}
                inputProps={{ style: { color: '#fff' } }}
            />
            <IconButton onClick={onAttachmentClick} style={{ color: '#a0a0a0' }}>
                <FilePresentIcon />
            </IconButton>
        </div>
    );
};

export default ChatBar;