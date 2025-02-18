<script lang="ts">
  import { mdiConsoleNetworkOutline } from "@mdi/js"

  import { page } from "$app/stores"
  import Button from "$components/elements/Button.svelte"
  import Icon from "$components/elements/Icon.svelte"
  import SidebarSection from "$components/SidebarSection.svelte"
  import { controller } from "$lib/stores.svelte"

  import type { PageData } from "../routes/[cluster]/$types"
  import SidebarTagsSection from "../routes/[cluster]/SidebarTagsSection.svelte"

  let pageData = $derived($page.data as PageData)

  let visibleSidebar: "clusters" | "tags" | null = $state(null)

  $effect(() => {
    console.log(pageData)
  })
</script>

{#if visibleSidebar == "clusters"}
  <div class="sidebar">
    <SidebarSection>
      {#each pageData.clusters.sort((a, b) => b.sortOrder - a.sortOrder) as cluster}
        <Button
          icon={cluster.icon as any}
          href="/{cluster.name}"
          onclick={() => (visibleSidebar = null)}
        >
          {cluster.name}
        </Button>
      {/each}
      <Button
        icon="mdiCog"
        href="/settings/general"
        onclick={() => (visibleSidebar = null)}
      >
        Settings
      </Button>
    </SidebarSection>
  </div>
{/if}

{#if visibleSidebar == "tags"}
  <div class="sidebar">
    <SidebarTagsSection />
  </div>
{/if}

<main>
  <div
    class="button"
    onmousedown={() => (visibleSidebar = visibleSidebar ? null : "clusters")}
  >
    <div class="icon">
      <Icon name={(pageData.cluster?.icon as any) || "mdiCog"} />
    </div>
  </div>

  <div
    class="button"
    onmousedown={() => (visibleSidebar = visibleSidebar ? null : "tags")}
  >
    <div class="icon">
      <Icon name="mdiTagMultiple" />
    </div>
  </div>

  <div class="spacer"></div>

  <div class="button" onmousedown={() => $controller.setPopup("Quick Switch")}>
    <div class="icon">
      <Icon name="mdiCardSearch" />
    </div>
  </div>
</main>

<style lang="scss">
  @use "sass:color";
  $bottom-bar-height: 56px;

  .sidebar {
    scrollbar-width: none;
    scroll-padding: 38px;

    position: fixed;
    z-index: 1000;
    top: 0;
    bottom: $bottom-bar-height;
    left: 0;

    overflow-y: auto;

    width: 100%;

    background: var(--color-dark-level-1);
  }

  main {
    // TODO: Make dynamic
    $background-color: color.mix(#1c1c1c, #303030, 50%);

    display: flex;
    gap: 4px;
    justify-content: space-between;

    padding: 4px 12px;

    background: $background-color;

    .spacer {
      flex-grow: 1;
    }

    .button {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      justify-content: center;

      padding: 0.5rem;

      .icon {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;

        // width: 64px;
        width: 32px;
        height: 32px;
        border-radius: 16px;
      }
    }
  }
</style>
