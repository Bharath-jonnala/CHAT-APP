import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'gh-pages' ? '/CHAT-APP/' : '/', // ✅ Adjusts automatically
  plugins: [react()],
}));
