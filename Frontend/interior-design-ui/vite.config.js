import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: join(tmpdir(), 'interior-design-vite-cache'),
  server: { host: 'localhost', port: 5173 },
})
