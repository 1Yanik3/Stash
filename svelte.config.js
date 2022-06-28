import preprocess from "svelte-preprocess"
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  

  kit: {
    adapter: adapter(),

    prerender: {
      default: true
    },
		paths: {
			base: process.env.NODE_ENV != "production" ? '' : '/stash'
		},

    vite: {
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: '@use "src/variables.scss" as *;',
          },
        },
      },
      ssr: {
        noExternal: ['@egjs/grid']
      }
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
