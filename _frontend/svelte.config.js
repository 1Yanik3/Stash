import adapter from "@sveltejs/adapter-node"
import preprocess from "svelte-preprocess"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  onwarn: (warning, handler) => {
    if (warning.code.startsWith("a11y-")) {
      return
    }
    handler(warning)
  },

  kit: {
    adapter: adapter(),
    csrf: {
      checkOrigin: false
    },
    alias: {
      $components: "src/components",
      $reusables: "src/reusables"
    }
  },

  preprocess: [
    preprocess({
      scss: {
        prependData: '@use "src/styles/variables.scss" as *;'
      }
    })
  ]
}

export default config
