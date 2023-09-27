<script lang="ts">
    import Popup from "../../../reusables/Popup.svelte";
    import MediaViewer from "../../MediaViewer.svelte";
    import Toolbar from "../../Toolbar.svelte";
</script>

<main>
    <Toolbar />
    <MediaViewer />
</main>

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