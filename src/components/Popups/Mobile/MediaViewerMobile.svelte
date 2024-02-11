<script lang="ts">
    import { actionBar, settings } from "$lib/stores";
    import MediaViewer from "../../MediaViewer.svelte";
    import Toolbar from "../../Toolbar.svelte";
</script>

{#if !$actionBar}
<main>
    <MediaViewer />
    <Toolbar />
</main>
{/if}

<style lang="scss">
    main {
        position: fixed;
        z-index: 99;

        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;

        background: #202020;
    }
</style>
