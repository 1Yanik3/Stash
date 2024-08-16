<script lang="ts">
  import MobileBottomBar from "$components/MobileBottomBar.svelte"
  import { mobileBottomBarVisible, settings } from "$lib/stores"

</script>

<main class:mobile={$settings.mobileLayout}>
  <slot />

  {#if $settings.mobileLayout && $mobileBottomBarVisible}
    <MobileBottomBar />
  {/if}
</main>

<style lang="scss">
  main {
    display: grid;
    width: 100vw;
    height: 100vh;

    &.mobile {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
      height: 100vh;
    }
  }
</style>
