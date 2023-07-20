import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vue_jsx from '@vitejs/plugin-vue-jsx' 
import path from "path"
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { TDesignResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vue_jsx(), 
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }),
    Components({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    })  
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src') // @代替src
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 前端配置跨域，当然这个只是开发环境下的配置
    // 生产环境不存在跨域问题，因为前端和后端是部署在同一个服务器上的
    proxy:{
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true
      }
    }
  }
})
