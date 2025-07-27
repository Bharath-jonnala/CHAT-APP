import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'gh-pages' ? '/chat-app/' : '/', // ✅ Adjusts automatically
  plugins: [react()],
}));
