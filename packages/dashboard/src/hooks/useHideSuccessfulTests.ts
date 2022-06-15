import { useLocalStorage } from './useLocalStorage';

export const useHideSuccessfulTests = () =>
  useLocalStorage<boolean>('shouldHideSuccessfulTests', false);
