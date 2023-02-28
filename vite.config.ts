import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vue_jsx from '@vitejs/plugin-vue-jsx' 
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vue_jsx()],
  resolve: {
    alias: {
      '@': path.resolve('./src') // @代替src
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
