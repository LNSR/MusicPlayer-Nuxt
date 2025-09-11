// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'fs'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    }
  },
  // removed '@prisma/nuxt' to keep Prisma strictly server-side and avoid
  // client-bundle resolution issues (index-browser). Use the dedicated
  // `lib/prisma.ts` server client instead.
  modules: ['@nuxt/ui', '@pinia/nuxt', 'nuxt-music-flow'],
  css: ['~/assets/global.css'],
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },
  vite: {
    server: {
      https: {
        key: readFileSync('./localhost-key.pem'),
        cert: readFileSync('./localhost.pem')
      },
      hmr: {
        protocol: 'wss',
        host: 'localhost',
        port: 3000,
        clientPort: 3000
      }
    },
    // Prevent Vite from trying to pre-bundle or resolve @prisma/client for the
    // client. This keeps Prisma server-only.
    optimizeDeps: {
      exclude: ['@prisma/client']
    },
    ssr: {
      // Ensure @prisma/client is not treated as a client-side dependency; use
      // noExternal to avoid surprises from some plugin resolution behavior.
      noExternal: ['@prisma/client']
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  },
  nitro: {
    externals: {
      // Treat @prisma/client as external on the server runtime (do not bundle)
      external: ['@prisma/client']
    }
  }
})