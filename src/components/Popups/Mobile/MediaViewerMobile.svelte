<script lang="ts">
  import { actionBar, controller, visibleMedium } from "$lib/stores"
  import { onMount } from "svelte"
  import MediaViewer from "../../MediaViewer.svelte"
  import Toolbar from "../../Toolbar.svelte"

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

    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;

    background: #202020;
  }
</style>
