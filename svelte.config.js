import preprocess from "svelte-preprocess"
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {

  onwarn: (warning, handler) => {
    if (warning.code.startsWith('a11y-')) {
      return;
    }
    handler(warning);
  },
  
  kit: {
    adapter: adapter(),

    // prerender: {
    //   default: true
    // },

    // vite: {
    //   css: {
    //     preprocessorOptions: {
    //       scss: {
    //         additionalData: '@use "src/variables.scss" as *;',
    //       },
    //     },
    //   },
    //   ssr: {
    //     noExternal: ['@egjs/grid']
    //   }
    // },
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
