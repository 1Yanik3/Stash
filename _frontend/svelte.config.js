import adapter from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

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

  preprocess: [vitePreprocess()]
}

export default config
