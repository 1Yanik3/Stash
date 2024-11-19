<script lang="ts">
  import Fuse from "fuse.js"
  import { onMount } from "svelte"

  import { page } from "$app/stores"
  import Icon from "$components/Icon.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import {
    tagsController,
    type TagExtended
  } from "$lib/controllers/TagsController.svelte"
  import type { possibleIcons } from "$lib/possibleIcons"
  import { controller } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"

  import type { PageData } from "../../routes/[cluster]/$types"
  import { goto } from "$app/navigation"

  // TODO: Move to a seperate file (after moving controller to a seperate file)
  const actions: typeof resultRowValues = [
    {
      icon: "mdiImport",
      label: "/Import",
      onEnter: () => {
        $controller.setPopup("Quick Actions Import")
      }
    },
    {
      icon: "mdiCast",
      label: "/Cast",
      onEnter: () => {
        $controller.setPopup(null)
        $controller.setActionBar("Cast")
      }
    }
  ]

  let searcher: InstanceType<typeof Fuse> | null = $state(null)
  let value = $state("")
  let selectedIndex = $state(0)

  const gatherAllTags = async () => {
    const tags: typeof resultRowValues = []

    const addTagAndChildrenToArray = (tag: TagExtended, parentPrefix = "") => {
      tags.push({
        icon: tag.icon || "mdiFolderOutline",
        label: `#${parentPrefix}${tag.tag}${tag.children.length ? "/" : ""}`,
        action: tag.count,
        onEnter: (e: KeyboardEvent) => {
          if (e.shiftKey) mediaController.filters.selectedTags.push(tag)
          else mediaController.filters.selectedTags = [tag]
          $controller.setPopup(null)
        }
      })
      tag.children.forEach(child =>
        addTagAndChildrenToArray(child, `${tag.tag}/`)
      )
    }

    tagsController.tags_hierarchy.forEach(tag => addTagAndChildrenToArray(tag))

    return tags
  }

  const gatherAllClusters = async () =>
    ($page.data as PageData).clusters.map(
      cluster =>
        ({
          icon: cluster.icon as any,
          label: `!${cluster.name}`,
          onEnter: () => {
            goto(`/${cluster.name}`)
            $controller.setPopup(null)
          }
        }) satisfies (typeof resultRowValues)[number]
    )

  const gatherAllFilters = async () =>
    [
      {
        icon: "mdiStarOutline",
        label: "@favourited",
        action: "All"
      }
    ] satisfies typeof resultRowValues

  const executeSearch = (query: string) => {
    if (!searcher) return []

    return searcher
      .search(query)
      .slice(0, 7)
      .map(i => i.item) as typeof resultRowValues
  }

  const resultRowValues: {
    icon: keyof typeof possibleIcons
    label: string
    action?: number | string
    onTab?: (e: KeyboardEvent) => void
    onEnter?: (e: KeyboardEvent) => void
  }[] = $derived(executeSearch(value))

  Promise.all([
    actions,
    gatherAllTags(),
    gatherAllFilters(),
    gatherAllClusters()
  ]).then(data => {
    searcher = new Fuse(data.flat(), {
      keys: ["label"]
    })
  })

  onMount(() => {
    const input = document.getElementById(
      "quick-switch-input"
    ) as HTMLInputElement
    input.focus()
  })
</script>

<Popup hideHeader onclose={() => $controller.setPopup(null)}>
  <main>
    <input
      id="quick-switch-input"
      type="search"
      placeholder="Search for #tags, @filters, !clusters, or /commands"
      bind:value
      autocomplete="off"
      onkeydown={(e: KeyboardEvent) => {
        if (e.key == "ArrowUp") {
          if (selectedIndex > 0) selectedIndex--
        } else if (e.key == "ArrowDown") {
          if (selectedIndex <= resultRowValues.length) selectedIndex++
        } else if (e.key == "Enter") {
          resultRowValues[selectedIndex].onEnter?.(e)
        } else if (e.key == "Tab") {
          resultRowValues[selectedIndex].onTab?.(e)
        } else {
          selectedIndex = 0
        }
      }}
    />
    <div class="search-result-section">
      {#each resultRowValues as result, i}
        <div class="result-row" class:selected={selectedIndex == i}>
          <div class="icon">
            <Icon name={result.icon} size={0.8} />
          </div>
          <span class="label">{result.label}</span>
          {#if result.action}
            <div class="action">{result.action}</div>
          {/if}
        </div>
      {/each}
    </div>
    <!-- <div class="currently-selected-section">
      <div class="badge">
        <Icon name="mdiTag" size={0.8} />
        <span>#pet/cats</span>
      </div>
    </div> -->
  </main>
</Popup>

<style lang="scss">
  main {
    display: grid;
    gap: 0.5rem;
    min-width: 450px;

    input {
      margin: -0.5rem;
      margin-bottom: 0;
      padding: 0.5rem;
      font-size: 1rem;
      border: none;
      border-bottom: 1px solid var(--border-color-1);
    }

    .search-result-section {
      .result-row {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 0.25rem;

        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
        }

        .label {
          display: flex;
          align-items: center;
          flex-grow: 1;
        }

        .action {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-dark-level-3);
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
        }

        &.selected {
          background-color: var(--color-dark-level-2);
          outline: 1px solid var(--border-color-1);
        }
      }
    }

    .currently-selected-section {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem;
      padding-top: 0;

      .badge {
        display: flex;
        align-items: center;
        background-color: var(--color-dark-level-2);
        border: 1px solid var(--border-color-1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;

        span {
          margin-left: 0.5rem;
        }
      }
    }
  }
</style>
