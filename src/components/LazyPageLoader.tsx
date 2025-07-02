import React, { Suspense } from 'react';
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

interface LazyPageLoaderProps {
  children: React.ReactNode;
}

const PageSkeleton = () => (
  <Box sx={{ p: 3, height: '100%' }}>
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="rectangular" width="70%" height={40} sx={{ mb: 3, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="rectangular" width="85%" height={80} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="60%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
    </motion.div>
  </Box>
);



const LazyPageLoader: React.FC<LazyPageLoaderProps> = ({ children }) => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {children}
    </Suspense>
  );
};

export default LazyPageLoader; 