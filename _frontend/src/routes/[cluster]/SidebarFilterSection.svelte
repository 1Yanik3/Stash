<script lang="ts">
  import { derived } from "svelte/store"

  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import Select from "$components/Select.svelte"
  import SidebarSection from "$components/SidebarSection.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { tagsController } from "$lib/controllers/TagsController.svelte"
  import {
    activeSetMethod,
    activeSortingMethod,
    favouritesOnly,
    mediaTypeFilter,
    seed,
    traverse
  } from "$lib/stores"

  import { setMethods, sortingMethods } from "../../types"
  import type { PageData } from "./$types"
  import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"

  $: pageData = $page.data as PageData
</script>

<SidebarSection horizontal>
  <Button
    hidden
    icon="mdiBookshelf"
    onclick={() => {
      selectedTags.set([])
    }}
    active={tagsController.selectedTags.length == 0}
  >
    All
  </Button>
  <!-- <Button
    hidden
    icon={tagsController.selectedTags[0].tag == "show_unsorted"
      ? "mdiNumeric0"
      : tagsController.selectedTags[0].tag == "show_single"
        ? "mdiNumeric1"
        : tagsController.selectedTags[0].tag == "show_dual"
          ? "mdiNumeric2"
          : tagsController.selectedTags[0].tag == "show_tripple"
            ? "mdiNumeric3"
            : "mdiAllInclusive"}
    onclick={() => {
      // TODO: fix this
      //   if (tagsController.selectedTags[0].tag == "show_unsorted") {
      //     tagsController.selectedTags = ["show_single"]
      //   } else if (tagsController.selectedTags[0].tag == "show_single") {
      //     tagsController.selectedTags = ["show_dual"]
      //   } else if (tagsController.selectedTags[0].tag == "show_dual") {
      //     tagsController.selectedTags = ["show_tripple"]
      //   } else if (tagsController.selectedTags[0].tag == "show_tripple") {
      //     tagsController.selectedTags = []
      //   } else {
      //     tagsController.selectedTags = ["show_unsorted"]
      //   }
    }}
    active={[
      "show_unsorted",
      "show_single",
      "show_dual",
      "show_tripple"
    ].includes(
      // @ts-ignore
      tagsController.selectedTags[0]
    )}
  >
    Unsorted
  </Button> -->
  <!-- <Button
    hidden
    icon="mdiTrashCanOutline"
    onclick={() => {
      selectedTags.set(["SHOW_TRASHED"])
    }}
    active={tagsController.selectedTags[0] == "SHOW_TRASHED"}
  >
    Trashed
  </Button> -->
</SidebarSection>

<SidebarSection title="Filters">
  <Button
    disabled={["collection", "stories"].includes(pageData.cluster?.type)}
    onclick={() => {
      activeSortingMethod.set(
        sortingMethods[
          (sortingMethods.indexOf($activeSortingMethod) + 1) %
            sortingMethods.length
        ]
      )

      // TODO: Do I need to invalidate the Media as well?
      // TODO: Invalidate Tags
    }}
    oncontextmenu={e => {
      e.preventDefault()
      seed.set(Math.random())
    }}
    icon={$activeSortingMethod.icon}
    tooltip={{
      title: derived(
        activeSortingMethod,
        $activeSortingMethod => $activeSortingMethod.title
      ),
      position: "right"
    }}
  >
    Sorting Method
  </Button>

  <Button
    disabled={pageData.cluster?.type == "stories"}
    onclick={() => {
      traverse.set(!$traverse)
    }}
    icon={$traverse ? "mdiHook" : "mdiHookOff"}
    tooltip={{
      title: derived(traverse, $traverse =>
        $traverse ? "Traversing" : "Not Traversing"
      ),
      position: "right"
    }}
  >
    Traverse
  </Button>

  <Button
    disabled={["collection", "stories"].includes(pageData.cluster?.type)}
    onclick={() => {
      activeSetMethod.set(
        setMethods[
          (setMethods.indexOf($activeSetMethod) + 1) % setMethods.length
        ]
      )
    }}
    icon={$activeSetMethod.icon}
    tooltip={{
      title: derived(
        activeSetMethod,
        $activeSetMethod => $activeSetMethod.title
      ),
      position: "right"
    }}
  >
    Set Method ({$activeSetMethod.title})
  </Button>

  {#if $mediaTypeFilter == ""}
    <Button
      icon="mdiMultimedia"
      onclick={() => {
        mediaTypeFilter.set("image")
      }}
      tooltip={{
        title: "All Media",
        position: "right"
      }}
    >
      Image
    </Button>
  {:else if $mediaTypeFilter == "image"}
    <Button
      icon="mdiImageOutline"
      onclick={() => {
        mediaTypeFilter.set("video")
      }}
      tooltip={{
        title: "Only Images",
        position: "right"
      }}
    >
      Image
    </Button>
  {:else if $mediaTypeFilter == "video"}
    <Button
      icon="mdiVideoOutline"
      onclick={() => {
        mediaTypeFilter.set("")
      }}
      tooltip={{
        title: "Only Videos",
        position: "right"
      }}
    >
      Image
    </Button>
  {/if}

  <Button
    icon={$favouritesOnly ? "mdiStar" : "mdiStarOutline"}
    onclick={() => {
      favouritesOnly.set(!$favouritesOnly)
    }}
    tooltip={{
      title: derived(favouritesOnly, $favouritesOnly =>
        $favouritesOnly ? "Only Favourited" : "All Media"
      ),
      position: "right"
    }}
  >
    Favourited
  </Button>
</SidebarSection>

<!-- TODO: Make dynamic -->
{#if pageData.cluster.id == 2 || pageData.cluster.id == 6}
  <Select
    bind:value={mediaController.filter_specialFilterAttribute}
    options={[
      { value: null, name: "All" },
      { value: "solo", name: "Solo", icon: "mdiAccount" },
      { value: "two", name: "Two", icon: "mdiAccountMultiple" },
      { value: "three", name: "Three", icon: "mdiAccountGroup" },
      { value: "group", name: "Group", icon: "mdiAccountMultiplePlus" },
      { value: "show_unknown", name: "Unknown", icon: "mdiAccountQuestion" }
    ]}
  />
{/if}
