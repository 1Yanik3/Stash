<script lang="ts">
  import DropFile from "$components/DropFile.svelte"
  import ImageGrid from "$components/ImageGrid/ImageGrid.svelte"
  import MediaViewer from "$components/MediaViewer/MediaViewer.svelte"

  import {
    actionBar,
    actionBars,
    isFullscreen,
    settings,
    visibleMedium,
    controller
  } from "$lib/stores"
  import NavigationSection from "./NavigationSection.svelte"

  const onscroll = (e: Event) => {
    const target = e.target as HTMLDivElement
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 500) {
      $controller.mediaController.loadMoreMedia()
    }
  }
</script>

<main class:mobile={$settings.mobileLayout}>
  {#if !$isFullscreen && !$settings.mobileLayout}
    <NavigationSection />
  {/if}

  {#if !$isFullscreen}
    <section id="imageGallerySection" on:scroll={onscroll}>
      <DropFile>
        <ImageGrid />
      </DropFile>
    </section>
  {/if}

  {#if $actionBar}
    <svelte:component this={actionBars[$actionBar]} />
  {/if}

  {#if $visibleMedium && !$settings.mobileLayout && $actionBar != "Cast"}
    <MediaViewer />
  {/if}
</main>

<style lang="scss">
  main {
    overflow: scroll;
    overflow-y: auto;
    display: flex;
    background: $color-dark-level-base;

    #imageGallerySection {
      position: relative;

      overflow: scroll;
      flex-basis: 0;
      flex-grow: 1;

      min-width: 350px;
      padding: 1em;
    }

    &.mobile {
      #imageGallerySection {
        min-width: unset;
      }
    }
  }
</style>
