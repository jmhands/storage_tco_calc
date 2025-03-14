import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-drives-csv',
      closeBundle() {
        // Ensure dist directory exists
        if (!fs.existsSync('dist')) {
          fs.mkdirSync('dist')
        }
        // Copy drives.csv from root to dist
        fs.copyFileSync('drives.csv', 'dist/drives.csv')
      }
    }
  ],
  publicDir: false // Disable automatic public dir copying since we're handling it manually
})