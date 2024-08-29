<script lang="ts">
  import DropFile from "$components/DropFile.svelte"
  import ImageGrid from "$components/ImageGrid/ImageGrid.svelte"
  import MediaViewer from "$components/MediaViewer/MediaViewer.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { actionBar, actionBars, isFullscreen, settings } from "$lib/stores"

  import FilterBar from "./FilterBar.svelte"
  import Sidebar from "./Sidebar.svelte"

  const onscroll = (e: Event) => {
    const target = e.target as HTMLDivElement
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 500) {
      mediaController.loadMoreMedia()
    }
  }

  let filterBarVisible = true
</script>

<main class:mobile={$settings.mobileLayout}>
  {#if !$isFullscreen && !$settings.mobileLayout}
    <Sidebar bind:filterBarVisible />
  {/if}

  {#if !$isFullscreen}
    <div class="center">
      {#if filterBarVisible}
        <FilterBar />
      {/if}
      <section id="imageGallerySection" on:scroll={onscroll}>
        <DropFile>
          <ImageGrid />
        </DropFile>
      </section>
    </div>
  {/if}

  {#if $actionBar}
    <svelte:component this={actionBars[$actionBar]} />
  {/if}

  {#if mediaController.visibleMedium && !$settings.mobileLayout && $actionBar != "Cast"}
    <MediaViewer />
  {/if}
</main>

<style lang="scss">
  main {
    overflow: scroll;
    overflow-y: auto;
    display: flex;
    background: var(--color-dark-level-base);

    .center {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      #imageGallerySection {
        position: relative;

        overflow: scroll;
        flex-basis: 0;
        flex-grow: 1;

        min-width: 350px;
        padding: 1em;
      }
    }

    &.mobile {
      #imageGallerySection {
        min-width: unset;
      }
    }
  }
</style>
