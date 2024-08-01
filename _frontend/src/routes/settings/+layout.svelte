<script lang="ts">
  import Button from "$components/Button.svelte"
  import MobileBottomBar from "$components/MobileBottomBar.svelte"
  import { isFullscreen, mobileBottomBarVisible, settings } from "$lib/stores"

  import ClusterSection from "../[cluster]/ClusterSection.svelte"
  import type { LayoutData } from "./$types"

  export let data: LayoutData
</script>

<main class:mobile={$settings.mobileLayout}>
  {#if !$settings.mobileLayout}
    <section
      class="clusterSection"
      style={$isFullscreen ? "display: none" : ""}
    >
      <ClusterSection />
    </section>
  {/if}

  <!-- TODO: Mobile support -->
  <section class="navigationSection">
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
    <Button icon="mdiFileFind" href="/settings/orphaned">Orphaned Files</Button>

    <div class="divider" />

    <Button icon="mdiChartBar" href="/settings/statistics">Statistics</Button>
    <Button icon="mdiInformationOutline" href="/settings/about">About</Button>
  </section>

  <div class="content">
    <slot />
  </div>

  {#if $settings.mobileLayout && $mobileBottomBarVisible}
    <MobileBottomBar />
  {/if}
</main>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: auto auto 1fr;
    width: 100%;
    height: 100vh;

    .clusterSection {
      display: flex;
      height: 100vh;
    }

    .navigationSection {
      overflow: hidden;
      display: flex;
      flex-direction: column;

      width: 234px;
      padding: 5px 0;

      background: var(--color-dark-level-1);
      border-right: 1px solid var(--border-color-base);

      .divider {
        flex-grow: 1;
      }

      //   &.mobile {
      //     height: 80vh;
      //     width: 100%;
      //     border: none;
      //   }
    }

    .content {
      overflow-y: scroll;
      width: calc(100% - 2em);
      height: calc(100vh - 2em);
      padding: 1em;
    }

    &.mobile {
      grid-template-columns: auto 1fr;
      //   grid-template-rows: 1fr auto;
      //   height: 100vh;
    }
  }
</style>
