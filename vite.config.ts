import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"

import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    external: [
      "@prisma/client",
      "prisma",
      "better-auth",
      "@better-auth/core",
      "@better-auth/prisma-adapter",
      "kysely",
      "h3-v2",
      "jose",
    ],
    noExternal: ["@better-auth/core", "better-auth"],
  },
  server: {
    watch: {
      usePolling: true, // helps on Windows
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tanstack/react-router",
      "@tanstack/react-query",
    ],
    exclude: [
      "better-auth",
      "@better-auth/core",
      "@better-auth/prisma-adapter",
      "@better-auth/kysely-adapter",
      "@better-auth/telemetry",
      "@better-auth/utils",
      "@better-fetch/fetch",
      "better-call",
      "kysely",
      "h3-v2",
      "jose",
      "defu",
      "@noble/ciphers",
      "@noble/hashes",
      "seroval",
    ],
  },
  cacheDir: ".vite-cache",
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config
