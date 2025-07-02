import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, pageKey }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier для более плавной анимации
        }}
        style={{ height: '100%', width: '100%' }}
      >
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition; 