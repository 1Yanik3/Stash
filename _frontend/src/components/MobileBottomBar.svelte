<script lang="ts">
  import { page } from "$app/stores"
  import tagsController from "$lib/controllers/TagsController.svelte"
  import { controller } from "$lib/stores"

  import type { PageData } from "../routes/[cluster]/$types"
  import SidebarHierarchyEntry from "../routes/[cluster]/SidebarHierarchyEntry.svelte"
    import Icon from "$components/elements/Icon.svelte"

  let pageData = $derived($page.data as PageData)

  let tagsSidebarVisible = $state(false)
</script>

{#if tagsSidebarVisible}
  <div class="sidebar">
    {#each tagsController.tagsHierarchy as tag}
      <SidebarHierarchyEntry {tag} />
    {/each}
  </div>
{/if}

<main>
  <div
    class="button"
    onmousedown={() => (tagsSidebarVisible = !tagsSidebarVisible)}
  >
    <div class="iconContainer">
      <div class="icon">
        <Icon name="mdiTag" />
      </div>
    </div>
  </div>

  <div class="title">
    <span>
      {pageData.cluster?.name}
    </span>
  </div>

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
    gap: 8px;
    justify-content: space-between;

    padding: 4px 0;

    background: $background-color;

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
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

        width: 64px;
        height: 32px;

        border-radius: 16px;
      }
    }
  }
</style>
