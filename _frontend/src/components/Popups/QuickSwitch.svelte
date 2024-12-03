<script lang="ts">
  import Fuse from "fuse.js"
  import { onMount } from "svelte"

  import { goto } from "$app/navigation"
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
  import { sortingMethods } from "../../types"

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
  let submenuOverwrite: typeof resultRowValues = $state([])

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
        icon: "mdiBackspace",
        label: "@clear",
        onEnter: () => {
          mediaController.filters.selectedTags = []
          mediaController.filters.favouritesOnly = false
          mediaController.filters.activeSortingMethod = 0
          $controller.setPopup(null)
        }
      },
      {
        icon: "mdiAllInclusive",
        label: "@all",
        onEnter: () => {
          mediaController.filters.selectedTags = []
        }
      },
      {
        icon: mediaController.filters.favouritesOnly
          ? "mdiStar"
          : "mdiStarOutline",
        label: "@favourited",
        action: mediaController.filters.favouritesOnly ? "ON" : "OFF",
        onEnter: () => {
          mediaController.filters.favouritesOnly =
            !mediaController.filters.favouritesOnly
          refreshFilters()
        }
      },
      ...sortingMethods.map((s, i) => ({
        icon: s.icon,
        label: `@sort/${s.title}`,
        action:
          mediaController.filters.activeSortingMethod == i ? "ON" : undefined,
        onEnter: () => {
          console.log("hi")
          if (
            i == mediaController.filters.activeSortingMethod &&
            sortingMethods[mediaController.filters.activeSortingMethod].id ==
              "Random"
          ) {
            mediaController.filters.seed = Math.random()
            console.log("seed")
          } else {
            mediaController.filters.activeSortingMethod = i
            refreshFilters()
          }
        }
      })),
      {
        icon: "mdiImage",
        label: "@type/image",
        action: mediaController.filters.mediaType == "image" ? "ON" : "",
        onEnter: () => {
          mediaController.filters.mediaType = "image"
          refreshFilters()
        }
      },
      {
        icon: "mdiVideo",
        label: "@type/video",
        action: mediaController.filters.mediaType == "video" ? "ON" : "",
        onEnter: () => {
          mediaController.filters.mediaType = "video"
          refreshFilters()
        }
      },
      {
        icon: "mdiMultimedia",
        label: "@type/all",
        action: mediaController.filters.mediaType == "all" ? "ON" : "",
        onEnter: () => {
          mediaController.filters.mediaType = "all"
          refreshFilters()
        }
      },
      {
        icon: "mdiPound",
        label: "@minResolution",
        action: mediaController.filters.minResolution || "",
        onTab: () => {
          submenuOverwrite = [
            { res: null, icon: "mdiAllInclusive" },
            { res: 720, icon: "mdiStandardDefinition" },
            { res: 1080, icon: "mdiHighDefinition" },
            { res: 2160, icon: "mdiVideo4kBox" }
          ].map(({ res, icon }) => ({
            label: `@minResolution/${res}`,
            icon: icon as keyof typeof possibleIcons,
            onEnter: () => {
              mediaController.filters.minResolution = res
              refreshFilters()
            }
          }))
        }
      },
      // TODO: Make dynamic
      ...($page.data.cluster.id == 2 || $page.data.cluster.id == 6
        ? [
            {
              icon: "mdiAccountMultiple",
              label: "@subjects",
              action: mediaController.filters.specialFilterAttribute || "",
              onTab: () => {
                submenuOverwrite = [
                  { value: null, name: "All", icon: "mdiAllInclusive" },
                  { value: "solo", name: "Solo", icon: "mdiAccount" },
                  { value: "two", name: "Two", icon: "mdiAccountMultiple" },
                  { value: "three", name: "Three", icon: "mdiAccountGroup" },
                  {
                    value: "group",
                    name: "Group",
                    icon: "mdiAccountMultiplePlus"
                  },
                  {
                    value: "show_unknown",
                    name: "Unknown",
                    icon: "mdiAccountQuestion"
                  }
                ].map(({ value, name, icon }) => ({
                  label: `@subjects/${name}`,
                  icon: icon as keyof typeof possibleIcons,
                  onEnter: () => {
                    mediaController.filters.specialFilterAttribute = value
                    refreshFilters()
                  }
                }))
              }
            } satisfies (typeof resultRowValues)[number]
          ]
        : []),
      {
        icon: "mdiPound",
        label: "@numberOfTags",
        action: mediaController.filters.countOfTags || "",
        onTab: () => {
          submenuOverwrite = [
            { value: -1, name: "All", icon: "mdiAllInclusive" },
            { value: 0, name: "0", icon: "mdiNumeric0" },
            { value: 1, name: "1", icon: "mdiNumeric1" },
            { value: 2, name: "2", icon: "mdiNumeric2" },
            { value: 3, name: "3", icon: "mdiNumeric3" }
          ].map(({ value, name, icon }) => ({
            label: `@numberOfTags/${name}`,
            icon: icon as keyof typeof possibleIcons,
            onEnter: () => {
              mediaController.filters.countOfTags = value
              refreshFilters()
            }
          }))
        }
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

  const refreshFilters = () =>
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

  refreshFilters()

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
        const selected = (
          submenuOverwrite.length ? submenuOverwrite : resultRowValues
        )[selectedIndex]
        if (e.key == "ArrowUp") {
          if (selectedIndex > 0) selectedIndex--
        } else if (e.key == "ArrowDown") {
          if (selectedIndex <= resultRowValues.length) selectedIndex++
        } else if (e.key == "Enter") {
          ;(selected.onEnter || selected.onTab)?.(e)
        } else if (e.key == "Tab") {
          e.preventDefault()
          selected.onTab?.(e)
        } else if (e.key == "Backspace" && submenuOverwrite.length) {
          submenuOverwrite = []
          e.preventDefault()
        } else {
          selectedIndex = 0
        }
      }}
    />
    <div class="search-result-section">
      {#each submenuOverwrite.length ? submenuOverwrite : resultRowValues as result, i}
        <div class="result-row" class:selected={selectedIndex == i}>
          <div class="icon">
            <Icon name={result.icon} size={0.8} />
          </div>
          <span class="label">
            {result.label}{#if result.onTab}
              /...
            {/if}
          </span>
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
    gap: 1rem;
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
      display: grid;
      gap: 0.5rem;

      .result-row {
        display: flex;
        gap: 0.5rem;
        padding: 0.25rem;
        border-radius: 0.25rem;

        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
        }

        .label {
          display: flex;
          flex-grow: 1;
          align-items: center;
        }

        .action {
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0.25rem 0.5rem;

          font-size: 14px;

          background-color: var(--color-dark-level-3);
          border-radius: 0.5rem;
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

        padding: 0.25rem 0.5rem;

        background-color: var(--color-dark-level-2);
        border: 1px solid var(--border-color-1);
        border-radius: 0.5rem;

        span {
          margin-left: 0.5rem;
        }
      }
    }
  }
</style>
