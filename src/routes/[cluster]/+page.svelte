<script lang="ts">
  import DropFile from "../../components/DropFile.svelte"
  import ImageGrid from "../../components/ImageGrid.svelte"
  import MediaViewer from "../../components/MediaViewer.svelte"
  import Toolbar from "../../components/Toolbar.svelte"

  import {
    actionBar,
    actionBars,
    isFullscreen,
    settings,
    visibleMedium
  } from "$lib/stores"
  import NavigationSection from "./NavigationSection.svelte"
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
    </section>
  {/if}

  {#if $actionBar}
    <svelte:component this={actionBars[$actionBar]} />
  {/if}

  {#if $visibleMedium && !$settings.mobileLayout && $actionBar != "Cast"}
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
    }

    #mediaPlayerSection {
      max-width: min(1000px, 40vw);
      min-width: 40vw;
    }

    &.mobile {
      #imageGallerySection {
        min-width: unset;
      }
    }
  }
</style>
