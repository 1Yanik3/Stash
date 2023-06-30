<script lang="ts">
    import Controller from "../../../Controller.svelte";

    import ImageGrid from "../../../components/ImageGrid.svelte";
    import Toolbar from "../../../components/Toolbar.svelte";
    import MediaViewer from "../../../components/MediaViewer.svelte";

    import {
        visibleMedium,
        controller,
        isFullscreen,
        isStoryFullScreen,
    } from "$lib/stores";
    import NavigationSection from "../../../components/Navigationbar/NavigationSection.svelte";
</script>

<Controller bind:this={$controller} />

<main>
    <section>
        <NavigationSection guest />
    </section>

    <section
        id="imageGallerySection"
        style={`${$visibleMedium ? "" : "grid-column: 2 / span 2;"} ${
            $isFullscreen ? "display: none" : ""
        } ${$isStoryFullScreen ? "grid-column: 1 / span 3;" : ""}`}
    >
        <ImageGrid guest />
    </section>

    {#if $visibleMedium}
        <section style={$isFullscreen ? "grid-column: 1 / span 3" : ""}>
            <Toolbar guest />

            <MediaViewer guest />
        </section>
    {/if}
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 300px minmax(200px, 600px) minmax(350px, 1fr);
        background: hsl(0, 0%, 13%);

        height: 100%;
        width: 100%;

        section {
            box-shadow: inset -0.7px 0 0 rgba($color: #fff, $alpha: 0.15);
            overflow-y: auto;

            // Image viewer
            &:nth-child(2) {
                padding: 1em;
                background: hsl(0, 0%, 19%);
            }

            // Image viewer
            &:nth-child(3) {
                max-height: 100vh;
            }
        }
    }
</style>
