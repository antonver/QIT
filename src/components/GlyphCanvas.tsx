import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { generateGlyph } from '../services/api';

interface GlyphCanvasProps {
  score: number;
}

const GlyphCanvas: React.FC<GlyphCanvasProps> = ({ score }) => {
  const [glyphData, setGlyphData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate glyph on mount
  useEffect(() => {
    const fetchGlyph = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const glyph = await generateGlyph(score);
        setGlyphData(glyph);
      } catch (err) {
        setError('Failed to generate glyph');
        console.error('Glyph generation failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlyph();
  }, [score]);

  // Handle export to Figma
  const handleExportToFigma = () => {
    if (!glyphData) return;

    // Convert SVG to data URL
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(glyphData)}`;
    
    // Create minimal Figma-compatible JSON
    const figmaData = {
      id: 'glyph-frame',
      name: 'ÆON Glyph',
      type: 'FRAME',
      fills: [
        {
          type: 'IMAGE',
          imageRef: svgDataUrl,
          scaleMode: 'FILL'
        }
      ],
      width: 200,
      height: 200
    };

    // Download as JSON file
    const blob = new Blob([JSON.stringify(figmaData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aeon-glyph.fig';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Generating ÆON Glyph...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your ÆON Glyph
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Score: {score} - This unique glyph represents your consciousness level
      </Typography>

      {/* Animated Glyph Display */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ marginBottom: '2rem' }}
      >
        <Box
          sx={{
            width: 300,
            height: 300,
            mx: 'auto',
            border: '2px solid #40C4FF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(64, 196, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {glyphData && (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              dangerouslySetInnerHTML={{ __html: glyphData }}
              style={{
                width: '80%',
                height: '80%',
                filter: 'drop-shadow(0 0 10px rgba(64, 196, 255, 0.5))'
              }}
            />
          )}
        </Box>
      </motion.div>

      {/* Export Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleExportToFigma}
          sx={{
            background: 'linear-gradient(45deg, #40C4FF 30%, #2196F3 90%)',
            color: 'white',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
            }
          }}
        >
          Export to Figma
        </Button>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          This glyph is unique to your consciousness level and can be used as a digital signature
        </Typography>
      </motion.div>
    </Box>
  );
};

export default GlyphCanvas; 