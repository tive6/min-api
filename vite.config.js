import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isProd = process.env.NODE_ENV === 'production'

console.log('TAURI_DEBUG', !!process.env.TAURI_DEBUG)

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target:
      process.env.TAURI_PLATFORM == 'windows'
        ? 'chrome105'
        : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // assetsInlineLimit: 4096,
    // reportCompressedSize: false,
    // rollupOptions: {
    //   output: {
    //     // 最小化拆分包
    //     manualChunks(id) {
    //       if (id.includes('node_modules')) {
    //         return id.toString().split('node_modules/')[1].split('/')[0].toString()
    //       }
    //     },
    //     chunkFileNames: 'assets/js/[name].[hash].js', // 用于命名代码拆分时创建的共享块的输出命名，[name]表示文件名,[hash]表示该文件内容hash值
    //   },
    // // external: ['antd'],
    // },
  },
  esbuild: {
    // drop: isProd ? ['console', 'debugger'] : [],
  },
}))
