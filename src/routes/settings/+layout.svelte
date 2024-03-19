<script lang="ts">
  import { isFullscreen, mobileBottomBarVisible, settings } from "$lib/stores"
  import MobileBottomBar from "$components/MobileBottomBar.svelte"
  import ClusterSection from "../[cluster]/ClusterSection.svelte"
  import SidebarButton from "../[cluster]/SidebarButton.svelte"
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
    <SidebarButton icon="mdiToggleSwitch" href="/settings/general">
      General
    </SidebarButton>
    <SidebarButton icon="mdiSync" href="/settings/jobs">Jobs</SidebarButton>
    <SidebarButton icon="mdiTagSearch" href="/settings/tag-icons">
      Tag Icons
    </SidebarButton>

    <div class="divider" />

    <SidebarButton icon="mdiChartBar" href="/settings/statistics">
      Statistics
    </SidebarButton>
    <SidebarButton icon="mdiInformationOutline" href="/settings/about">
      About
    </SidebarButton>
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

    height: 100vh;
    width: 100%;

    .clusterSection {
      height: 100vh;
      display: flex;
    }

    .navigationSection {
      width: 234px;
      overflow: hidden;
      padding: 5px 0;

      border-right: 1px solid $border-color-base;
      background: $color-dark-level-1;

      display: flex;
      flex-direction: column;

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
      padding: 1em;
      overflow-y: scroll;
    }

    &.mobile {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
      height: 100vh;
    }
  }
</style>
