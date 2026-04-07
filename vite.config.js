import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        login:      resolve(__dirname, 'login.html'),
        bookSearch: resolve(__dirname, 'book-search.html'),
        dark:       resolve(__dirname, 'dark.html'),
      },
    },
  },
})
