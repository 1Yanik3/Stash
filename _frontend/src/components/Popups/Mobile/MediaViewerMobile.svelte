<script lang="ts">
  import { onMount } from "svelte"

  import { actionBar, controller, visibleMedium } from "$lib/stores"

  import MediaViewer from "../../MediaViewer/MediaViewer.svelte"
  import Toolbar from "../../MediaViewer/Toolbar.svelte"

  onMount(() => {
    window.history.pushState({ popupOpened: true }, "")
  })

  const onPopState = (event: PopStateEvent) => {
    visibleMedium.set(null)
    $controller.setPopup(null)
  }
</script>

<svelte:window on:popstate={onPopState} />

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
    top: 0;
    left: 0;

    width: 100vw;
    height: 100vh;

    background: #202020;
  }
</style>
