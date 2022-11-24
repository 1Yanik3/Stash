import preprocess from "svelte-preprocess"
import adapter from '@sveltejs/adapter-auto'

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
    csrf: {
      checkOrigin: false,
    }
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
