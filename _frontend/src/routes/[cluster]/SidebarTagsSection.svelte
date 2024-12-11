<script lang="ts">
  import { page } from "$app/stores"
  import SidebarSection from "$components/SidebarSection.svelte"
  import tagsController from "$lib/controllers/TagsController.svelte"
  import { settings } from "$lib/stores"

  import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"
</script>

<main class:mobile={$settings.mobileLayout}>
  <SidebarSection>
    {#each Object.values(tagsController.tagMap)
      .filter(t => !t.parentId)
      .sort( (a, b) => ($page.params.cluster == "Camp Buddy" ? b.tag.localeCompare(a.tag) : b.count + b.indirectCount - (a.count + a.indirectCount)) ) as tag}
      <SidebarHierarchyEntry tagId={tag.id} />
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
