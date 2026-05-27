import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    external: ['@prisma/client', 'prisma'],
	},
	server: {
      watch: {
        usePolling: true, // helps on Windows
      },
    },
    optimizeDeps: {
      force: true, // force re-bundle on start to avoid stale lock
    },
  plugins: [devtools(), netlify(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
