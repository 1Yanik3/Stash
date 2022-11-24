import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],
    // ssr: {
    //     noExternal: ['@egjs/*']
    // },
    rules: {
        "a11y-click-events-have-key-events": "off"
    }
};

export default config;