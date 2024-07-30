<script lang="ts">
  import SidebarSection from "$components/SidebarSection.svelte"
  import Button from "$components/Button.svelte"
  import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"

  import { page } from "$app/stores"
  import { controller, selectedTags, settings } from "$lib/stores"

  import type { PageData } from "./$types"
  import { readable } from "svelte/store"

  $: pageData = $page.data as PageData

  $: ({ tags, hierarchicalTagsExceptPeople } =
    $controller?.tagsController ??
    readable({ tags: [], hierarchicalTagsExceptPeople: [] }))
</script>

{#if $page.data.cluster.type != "stories"}
  <main class:mobile={$settings.mobileLayout}>
    <div>
      <!-- Statics -->
      <SidebarSection horizontal>
        <Button
          hidden
          icon="mdiBookshelf"
          on:click={() => {
            selectedTags.set([])
          }}
          active={$selectedTags.length == 0}
        >
          All
        </Button>
        <Button
          hidden
          icon="mdiArchiveOutline"
          on:click={() => {
            selectedTags.set(["SHOW_UNSORTED"])
          }}
          active={$selectedTags[0] == "SHOW_UNSORTED"}
        >
          Unsorted
        </Button>
        <Button
          hidden
          icon={$selectedTags[0] == "show_single"
            ? "mdiNumeric1"
            : $selectedTags[0] == "show_dual"
              ? "mdiNumeric2"
              : $selectedTags[0] == "show_tripple"
                ? "mdiNumeric3"
                : "mdiAllInclusive"}
          on:click={() => {
            if ($selectedTags[0] == "show_single") {
              selectedTags.set(["show_dual"])
            } else if ($selectedTags[0] == "show_dual") {
              selectedTags.set(["show_tripple"])
            } else if ($selectedTags[0] == "show_tripple") {
              selectedTags.set([])
            } else {
              selectedTags.set(["show_single"])
            }
          }}
          active={["show_single", "show_dual", "show_tripple"].includes(
            // @ts-ignore
            $selectedTags[0]
          )}
        >
          Unsorted
        </Button>
        <Button
          hidden
          icon="mdiTrashCanOutline"
          on:click={() => {
            selectedTags.set(["SHOW_TRASHED"])
          }}
          active={$selectedTags[0] == "SHOW_TRASHED"}
        >
          Unsorted
        </Button>
      </SidebarSection>
    </div>

    <div>
      <!-- TODO: Cluster settings -->
      {#if pageData.cluster.id == 2 || pageData.cluster.id == 6}
        <SidebarSection title="People">
          <SidebarHierarchyEntry
            name="Solo"
            count={$tags?.find(t => t.tag[0] == "Solo")?.direct_count || 0}
            iconOverwrite="mdiAccount"
            children={[]}
          />
          <SidebarHierarchyEntry
            name="Two"
            count={$tags?.find(t => t.tag[0] == "Two")?.direct_count || 0}
            iconOverwrite="mdiAccountMultiple"
            children={[]}
          />
          <SidebarHierarchyEntry
            name="Three"
            count={$tags?.find(t => t.tag[0] == "Three")?.direct_count || 0}
            iconOverwrite="mdiAccountGroup"
            children={[]}
          />
          <SidebarHierarchyEntry
            name="Group"
            count={$tags?.find(t => t.tag[0] == "Group")?.direct_count || 0}
            iconOverwrite="mdiAccountMultiplePlus"
            children={[]}
          />

          {#await pageData.streamed.counters}
            <SidebarHierarchyEntry
              name="PEOPLE_COUNT_UNKNOWN"
              nameOverwrite="Unknown"
              iconOverwrite="mdiAccountQuestion"
              count=""
              children={[]}
            />
          {:then { untagged_count }}
            <SidebarHierarchyEntry
              name="PEOPLE_COUNT_UNKNOWN"
              nameOverwrite="Unknown"
              iconOverwrite="mdiAccountQuestion"
              count={untagged_count}
              children={[]}
            />
          {/await}
        </SidebarSection>
      {/if}

      <SidebarSection title="Tags">
        {#if $hierarchicalTagsExceptPeople}
          {#each $hierarchicalTagsExceptPeople as d}
            <SidebarHierarchyEntry {...d} />
          {/each}
        {/if}
      </SidebarSection>
    </div>
  </main>
{/if}

<style lang="scss">
  main {
    overflow: hidden;

    width: 234px;
    height: 100vh;

    background: var(--color-dark-level-1);
    border-right: 1px solid var(--border-color-base);

    & > :nth-child(2) {
      scrollbar-width: none;
      scroll-padding: 38px;
      overflow: scroll;
      height: calc(100% - 60px);

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &.mobile {
      width: 100%;
      height: 80vh;
      border: none;
    }
  }
</style>
