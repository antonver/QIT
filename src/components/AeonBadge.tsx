import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';

interface AeonBadgeProps {
  score: number;
}

const AeonBadge: React.FC<AeonBadgeProps> = ({ score }) => {
  // Determine badge properties based on score
  const getBadgeConfig = (score: number) => {
    if (score >= 90) {
      return {
        title: 'ÆON Master',
        color: '#FFD700',
        borderColor: '#FFD700',
        shape: 'hexagon',
        icon: '⭐',
        level: 'Master'
      };
    } else if (score >= 80) {
      return {
        title: 'ÆON Expert',
        color: '#C0C0C0',
        borderColor: '#C0C0C0',
        shape: 'circle',
        icon: '🔮',
        level: 'Expert'
      };
    } else if (score >= 70) {
      return {
        title: 'ÆON Adept',
        color: '#CD7F32',
        borderColor: '#CD7F32',
        shape: 'square',
        icon: '⚡',
        level: 'Adept'
      };
    } else if (score >= 60) {
      return {
        title: 'ÆON Initiate',
        color: '#40C4FF',
        borderColor: '#40C4FF',
        shape: 'triangle',
        icon: '🌱',
        level: 'Initiate'
      };
    } else {
      return {
        title: 'ÆON Seeker',
        color: '#666666',
        borderColor: '#666666',
        shape: 'diamond',
        icon: '🔍',
        level: 'Seeker'
      };
    }
  };

  const config = getBadgeConfig(score);

  // Handle export to Figma
  const handleExportToFigma = () => {
    // Create SVG content for the badge
    const svgContent = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${config.color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${config.borderColor};stop-opacity:0.7" />
          </linearGradient>
        </defs>
        <g transform="translate(100,100)">
          ${getShapePath(config.shape)}
          <text x="0" y="0" text-anchor="middle" dy="0.35em" font-family="Arial" font-size="24" fill="white">
            ${config.icon}
          </text>
        </g>
        <text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="14" fill="white">
          ${config.title}
        </text>
      </svg>
    `;

    // Convert to data URL
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    
    // Create Figma-compatible JSON
    const figmaData = {
      id: 'aeon-badge',
      name: config.title,
      type: 'FRAME',
      fills: [
        {
          type: 'IMAGE',
          imageRef: svgDataUrl,
          scaleMode: 'FILL'
        }
      ],
      width: 200,
      height: 200,
      cornerRadius: 8,
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.3 },
          offset: { x: 0, y: 4 },
          radius: 8
        }
      ]
    };

    // Download as JSON file
    const blob = new Blob([JSON.stringify(figmaData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.toLowerCase().replace(/\s+/g, '-')}.fig`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate SVG path for different shapes
  const getShapePath = (shape: string) => {
    switch (shape) {
      case 'hexagon':
        return `
          <path d="M-50,-30 L-25,-50 L25,-50 L50,-30 L50,30 L25,50 L-25,50 L-50,30 Z" 
                fill="url(#badgeGradient)" stroke="${config.borderColor}" stroke-width="2"/>
        `;
      case 'circle':
        return `
          <circle cx="0" cy="0" r="50" 
                  fill="url(#badgeGradient)" stroke="${config.borderColor}" stroke-width="2"/>
        `;
      case 'square':
        return `
          <rect x="-40" y="-40" width="80" height="80" 
                fill="url(#badgeGradient)" stroke="${config.borderColor}" stroke-width="2"/>
        `;
      case 'triangle':
        return `
          <path d="M0,-50 L-40,40 L40,40 Z" 
                fill="url(#badgeGradient)" stroke="${config.borderColor}" stroke-width="2"/>
        `;
      case 'diamond':
        return `
          <path d="M0,-50 L50,0 L0,50 L-50,0 Z" 
                fill="url(#badgeGradient)" stroke="${config.borderColor}" stroke-width="2"/>
        `;
      default:
        return `
          <circle cx="0" cy="0" r="50" 
                  fill="url(#badgeGradient)" stroke="${config.borderColor}" stroke-width="2"/>
        `;
    }
  };

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            mx: 'auto',
            mb: 3,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${config.color}20, ${config.borderColor}20)`,
            border: `3px solid ${config.borderColor}`,
            borderRadius: config.shape === 'circle' ? '50%' : 
                        config.shape === 'square' ? '8px' : '16px',
            boxShadow: `0 8px 32px ${config.color}40`,
            overflow: 'hidden'
          }}
        >
          {/* Badge Icon */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '3rem' }}
          >
            {config.icon}
          </motion.div>

          {/* Score Display */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              borderRadius: '12px',
              px: 1,
              py: 0.5,
              fontSize: '0.8rem'
            }}
          >
            {score}%
          </Box>
        </Box>
      </motion.div>

      {/* Badge Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Typography variant="h5" gutterBottom>
          {config.title}
        </Typography>
        
        <Chip 
          label={config.level} 
          color="primary" 
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Consciousness Level: {score}%
        </Typography>

        {/* Export Button */}
        <Button
          variant="contained"
          onClick={handleExportToFigma}
          sx={{
            background: `linear-gradient(45deg, ${config.color}, ${config.borderColor})`,
            color: 'white',
            px: 3,
            py: 1,
            '&:hover': {
              background: `linear-gradient(45deg, ${config.borderColor}, ${config.color})`,
            }
          }}
        >
          Export to Figma
        </Button>
      </motion.div>
    </Box>
  );
};

export default AeonBadge; 