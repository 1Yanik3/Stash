<script lang="ts">
  import { onMount } from "svelte"

  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { actionBar, controller } from "$lib/stores.svelte"

  import MediaViewer from "../MediaViewer/MediaViewer.svelte"
  import Toolbar from "../MediaViewer/Toolbar.svelte"

  onMount(() => {
    window.history.pushState({ popupOpened: true }, "")
  })

  const onPopState = (event: PopStateEvent) => {
    mediaController.visibleMedium = null
    $controller.setPopup(null)
  }
</script>

<svelte:window onpopstate={onPopState} />

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
