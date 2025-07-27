import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/chat-app/', // 👈 This is critical for GitHub Pages
  plugins: [react()],
});
