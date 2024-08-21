<script lang="ts">
  import { goto } from "$app/navigation"
  import Button from "$components/Button.svelte"
  import MobileBottomBar from "$components/MobileBottomBar.svelte"
  import { mobileBottomBarVisible, settings } from "$lib/stores"

  let { children, data } = $props()
</script>

<main class:mobile={$settings.mobileLayout}>
  <!-- TODO: Mobile support -->
  <section class="sidebar">
    {#if !$settings.mobileLayout}
      <div style="display: flex;">
        <Button icon="mdiArrowLeft" on:click={() => goto("/")} />
      </div>
    {/if}

    <Button icon="mdiToggleSwitch" href="/settings/general">General</Button>
    <Button icon="mdiRhombusSplit" href="/settings/clusters">Clusters</Button>
    <Button icon="mdiPassport" href="/settings/credentials">Credentials</Button>
    <Button icon="mdiSync" href="/settings/jobs">Jobs</Button>
    <Button
      icon="mdiContentDuplicate"
      href="/settings/duplicates"
      count={data.duplicates_count}
    >
      Duplicates
    </Button>
    <Button icon="mdiTagMultiple" href="/settings/icon-assignments">
      Icon Assignments
    </Button>
    <Button icon="mdiImageMultiple" href="/settings/icon-packs">
      Icon Packs
    </Button>
    <Button
      icon="mdiFileFind"
      href="/settings/orphaned"
      count={data.unimported_count}>Orphaned Files</Button
    >

    <div class="divider" />

    <Button icon="mdiChartBar" href="/settings/statistics">Statistics</Button>
    <Button icon="mdiInformationOutline" href="/settings/about">About</Button>
  </section>

  <div class="content">
    {@render children()}
  </div>

  {#if $settings.mobileLayout && $mobileBottomBarVisible}
    <div class="mobileBottomBar">
      <MobileBottomBar />
    </div>
  {/if}
</main>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: 234px 1fr;
    height: 100vh;

    .sidebar {
      overflow: hidden;
      display: flex;
      flex-direction: column;

      padding: 5px 0;

      background: var(--color-dark-level-1);
      border-right: 1px solid var(--border-color-base);

      .divider {
        flex-grow: 1;
      }
    }

    .content {
      flex-grow: 1;
      overflow: hidden;
    }

    .mobileBottomBar {
      grid-column: span 2;
    }

    &.mobile {
      grid-template-columns: 60px 1fr;
    }
  }
</style>
