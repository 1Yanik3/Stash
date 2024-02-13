<script lang="ts">
  import { md5 } from "hash-wasm"

  import SidebarSection from "../../components/SidebarSection.svelte"
  import SidebarButton from "./SidebarButton.svelte"
  import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"

  import { page } from "$app/stores"
  import { selectedTags, settings, traverse } from "$lib/stores"

  import type { PageData } from "./$types"

  $: pageData = $page.data as PageData

  function orderDataHierarchically(
    rawData: Awaited<typeof pageData.streamed_page.tags>
  ) {
    type TagData = {
      name: string
      count: number
      children: TagData
    }[]

    let tagData: TagData = []
    rawData
      .sort((a, b) => a.tag.length - b.tag.length)
      .forEach(({ tag, direct_count, indirect_count }) => {
        const addAt = (at: TagData, i: number) => {
          if (!tag[i]) return

          const parent = at.find(t => t.name == tag[i])

          if (parent) {
            // Add as child
            addAt(parent.children, i + 1)
          } else {
            // Add as new
            const children: TagData = []
            at.push({
              name: tag[i],
              count: $traverse ? direct_count + indirect_count : direct_count,
              children
            })
            addAt(children, i + 1)
          }
        }

        addAt(tagData, 0)
      })

    // TODO
    return tagData.sort((a, b) =>
      $page.params.cluster == "Camp Buddy"
        ? b.name.localeCompare(a.name)
        : b.count - a.count
    )
  }

  let tags: Awaited<typeof pageData.streamed_page.tags> = []
  let orderDataHierarchicallyOnlyPeople: ReturnType<
    typeof orderDataHierarchically
  > = []
  let orderDataHierarchicallyExceptPeople: ReturnType<
    typeof orderDataHierarchically
  > = []
  let lastHash = ""

  const updateTagsIfChangesExist = async (
    newData: Promise<Awaited<typeof pageData.streamed_page.tags>>
  ) => {
    const newHash = await md5(JSON.stringify(await newData))
    if (newHash == lastHash) return

    tags = await newData
    lastHash = newHash

    orderDataHierarchicallyOnlyPeople = orderDataHierarchically(
      tags.filter(t => ["Solo", "Two", "Group"].includes(t.tag[0]))
    )

    orderDataHierarchicallyExceptPeople = orderDataHierarchically(
      tags.filter(t => !["Solo", "Two", "Group"].includes(t.tag[0]))
    )
  }
  $: updateTagsIfChangesExist(pageData.streamed_page.tags)
</script>

{#if $page.data.cluster.type != "stories"}
  <main class:mobile={$settings.mobileLayout}>
    <div>
      <!-- Statics -->
      <SidebarSection horizontal>
        <SidebarButton
          hidden
          icon="mdiBookshelf"
          on:click={() => {
            selectedTags.set([])
          }}
          active={$selectedTags.length == 0}
        >
          All
        </SidebarButton>
        <SidebarButton
          hidden
          icon="mdiArchiveOutline"
          on:click={() => {
            selectedTags.set(["SHOW_UNSORTED"])
          }}
          active={$selectedTags[0] == "SHOW_UNSORTED"}
        >
          Unsorted
        </SidebarButton>
        <SidebarButton
          hidden
          icon="mdiTrashCanOutline"
          on:click={() => {
            selectedTags.set(["SHOW_TRASHED"])
          }}
          active={$selectedTags[0] == "SHOW_TRASHED"}
        >
          Unsorted
        </SidebarButton>
      </SidebarSection>
    </div>

    <div>
      <!-- TODO: Cluster settings -->
      {#if pageData.cluster.id == 2 || pageData.cluster.id == 6}
        <SidebarSection title="People">
          {#each orderDataHierarchicallyOnlyPeople as { name, count, children }}
            <SidebarHierarchyEntry {name} {count} {children} />
          {/each}
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
        {#each orderDataHierarchicallyExceptPeople as d}
          <SidebarHierarchyEntry {...d} />
        {/each}
      </SidebarSection>
    </div>
  </main>
{/if}

<style lang="scss">
  main {
    height: 100vh;
    width: 234px;
    overflow: hidden;

    border-right: 1px solid $border-color-base;
    background: $color-dark-level-1;

    & > :nth-child(2) {
      overflow: scroll;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
      height: calc(100% - 60px);
      scroll-padding: 38px;
    }

    &.mobile {
      height: 80vh;
      width: 100%;
      border: none;
    }
  }
</style>
