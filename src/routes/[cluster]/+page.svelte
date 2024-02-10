<script lang="ts">
    import Icon from "../../components/Icon.svelte";

    import DropFile from "../../components/DropFile.svelte";
    import ImageGrid from "../../components/ImageGrid.svelte";
    import MediaViewer from "../../components/MediaViewer.svelte";
    import Toolbar from "../../components/Toolbar.svelte";

    import { invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import {
        actionBar,
        actionBars,
        isFullscreen,
        selectedTags,
        settings,
        visibleMedium,
    } from "$lib/stores";
    import { tweened } from "svelte/motion";
    import NavigationSection from "./NavigationSection.svelte";

    const opacity = tweened(0, { duration: 200 });
    let previousMediaHash = "";
    page.subscribe((a) => {
        if (previousMediaHash != $page.data.mediaHash) {
            previousMediaHash = $page.data.mediaHash;
            opacity.set(1, { duration: 0 });
            opacity.set(0, {
                delay: 75,
            });
        }
    });
</script>

<main class:mobile={$settings.mobileLayout}>
    {#if !$isFullscreen && !$settings.mobileLayout}
        <NavigationSection />
    {/if}

    {#if !$isFullscreen}
        <section id="imageGallerySection">
            <DropFile>
                <ImageGrid />
            </DropFile>
            
            <ImageGrid />

            {#if $page.data.cluster.type != "stories"}
                <div style:opacity={$opacity} class="transitionBox" />
            {/if}
        </section>
    {/if}

    {#if $actionBar}
        <section class="actionBar">
            <svelte:component this={actionBars[$actionBar]} />
        </section>
    {:else if $visibleMedium && !$settings.mobileLayout}
        <section
            id="mediaPlayerSection"
            style={$isFullscreen
                ? "grid-column: span 3; width: 100vw; max-width: 100vw"
                : ""}
        >
            <Toolbar />
            <MediaViewer />
        </section>
    {/if}
</main>

<style lang="scss">
    main {
        display: flex;
        overflow: scroll;

        background: $color-dark-level-base;
        overflow-y: auto;

        #imageGallerySection {
            overflow: scroll;
            padding: 1em;
            min-width: 350px;
            flex-grow: 1;
            flex-basis: 0;

            position: relative;

            .transitionBox {
                position: fixed;
                top: 0;
                left: 300px; // TODO
                right: 0;
                bottom: 0;
                background: $color-dark-level-base;
                z-index: 10;
                pointer-events: none;
            }
        }

        #mediaPlayerSection {
            max-width: 1000px;
            min-width: 300px;
        }

        .actionBar {
            width: 64px;
        }

        &.mobile {
            #imageGallerySection {
                min-width: unset;
            }
        }
    }
</style>
