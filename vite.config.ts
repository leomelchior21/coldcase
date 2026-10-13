import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], server: { port: 5176, strictPort: true }, build: { rollupOptions: { output: { manualChunks: { editor: ['@codemirror/lang-python','@codemirror/language','@codemirror/state','@codemirror/view','@codemirror/commands','@lezer/highlight'] } } } } });
