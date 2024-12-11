import { sentrySvelteKit } from "@sentry/sveltekit";
import path from "path"

import { sveltekit } from "@sveltejs/kit/vite"

/** @type {import('vite').UserConfig} */
const config = {
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
      $components: path.resolve("./src/components"),
      $reusables: path.resolve("./src/reusables")
    }
  },

  plugins: [sentrySvelteKit({
    sourceMapsUploadOptions: {
      org: "ant-2s",
      project: "stash"
    }
  }), sveltekit()],

  ssr: {
    noExternal: ["@egjs/*"]
  },

  rules: {
    "a11y-click-events-have-key-events": "off"
  },

  server: {
    cors: false
  }
}

export default config