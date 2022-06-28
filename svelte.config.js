import preprocess from "svelte-preprocess"
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  optimizeDeps: {
    exclude: ['@egjs/svelte-grid', '@egjs/grid'],
  },

  kit: {
    adapter: adapter(),

    prerender: {
      default: true
    },

    vite: {
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: '@use "src/variables.scss" as *;',
          },
        },
      },
    },
  },

  preprocess: [
    preprocess({
      scss: {
        prependData: '@use "src/variables.scss" as *;',
      },
    }),
  ],
}

export default config
