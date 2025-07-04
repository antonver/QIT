import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Используем вместо простого useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Используем вместо простого useSelector
export const useAppSelector = <T>(selector: (state: RootState) => T) => 
  useSelector<RootState, T>(selector); 