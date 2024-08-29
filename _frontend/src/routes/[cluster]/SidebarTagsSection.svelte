<script lang="ts">
  import SidebarSection from "$components/SidebarSection.svelte"
  import { tagsController } from "$lib/controllers/TagsController.svelte"
  import { settings } from "$lib/stores"

  import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"
</script>

<main class:mobile={$settings.mobileLayout}>
  <SidebarSection>
    {#each tagsController.tags_hierarchy as tag}
      <SidebarHierarchyEntry {tag} />
    {/each}
  </SidebarSection>
</main>

<style lang="scss">
  main {
    scrollbar-width: none;
    scroll-padding: 38px;
    overflow: scroll;
    max-height: calc(100vh - 69px);

    &.mobile {
      max-height: calc(100vh - 200px);
    }
  }
</style>
