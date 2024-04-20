<script lang="ts">
  import { isFullscreen, mobileBottomBarVisible, settings } from "$lib/stores"
  import MobileBottomBar from "$components/MobileBottomBar.svelte"

  import ClusterSection from "./ClusterSection.svelte"
</script>

<main class:mobile={$settings.mobileLayout}>
  {#if !$settings.mobileLayout}
    <section style={$isFullscreen ? "display: none" : ""}>
      <ClusterSection />
    </section>
  {/if}

  <slot />

  {#if $settings.mobileLayout && $mobileBottomBarVisible}
    <MobileBottomBar />
  {/if}
</main>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: auto 1fr;
    width: 100%;
    height: 100vh;

    section {
      display: flex;
      height: 100vh;
    }

    &.mobile {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
      height: 100vh;
    }
  }
</style>
