<script lang="ts">
  import { derived } from "svelte/store"

  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import SidebarSection from "$components/SidebarSection.svelte"
  import { tagsController } from "$lib/controllers/TagsController.svelte"
  import {
    activeSetMethod,
    activeSortingMethod,
    favouritesOnly,
    mediaTypeFilter,
    seed,
    selectedTags,
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
    active={$selectedTags.length == 0}
  >
    All
  </Button>
  <Button
    hidden
    icon={$selectedTags[0] == "show_unsorted"
      ? "mdiNumeric0"
      : $selectedTags[0] == "show_single"
        ? "mdiNumeric1"
        : $selectedTags[0] == "show_dual"
          ? "mdiNumeric2"
          : $selectedTags[0] == "show_tripple"
            ? "mdiNumeric3"
            : "mdiAllInclusive"}
    onclick={() => {
      if ($selectedTags[0] == "show_unsorted") {
        selectedTags.set(["show_single"])
      } else if ($selectedTags[0] == "show_single") {
        selectedTags.set(["show_dual"])
      } else if ($selectedTags[0] == "show_dual") {
        selectedTags.set(["show_tripple"])
      } else if ($selectedTags[0] == "show_tripple") {
        selectedTags.set([])
      } else {
        selectedTags.set(["show_unsorted"])
      }
    }}
    active={[
      "show_unsorted",
      "show_single",
      "show_dual",
      "show_tripple"
    ].includes(
      // @ts-ignore
      $selectedTags[0]
    )}
  >
    Unsorted
  </Button>
  <Button
    hidden
    icon="mdiTrashCanOutline"
    onclick={() => {
      selectedTags.set(["SHOW_TRASHED"])
    }}
    active={$selectedTags[0] == "SHOW_TRASHED"}
  >
    Trashed
  </Button>
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
    oncontextmenu={({ detail }) => {
      detail.preventDefault()
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

{#if pageData.cluster.id == 2 || pageData.cluster.id == 6}
  <SidebarSection title="People">
    <SidebarHierarchyEntry
      name="Solo"
      count={tagsController.tags.find(t => t.tag[0] == "Solo")?.direct_count ||
        0}
      iconOverwrite="mdiAccount"
      children={[]}
    />
    <SidebarHierarchyEntry
      name="Two"
      count={tagsController.tags.find(t => t.tag[0] == "Two")?.direct_count ||
        0}
      iconOverwrite="mdiAccountMultiple"
      children={[]}
    />
    <SidebarHierarchyEntry
      name="Three"
      count={tagsController.tags.find(t => t.tag[0] == "Three")?.direct_count ||
        0}
      iconOverwrite="mdiAccountGroup"
      children={[]}
    />
    <SidebarHierarchyEntry
      name="Group"
      count={tagsController.tags.find(t => t.tag[0] == "Group")?.direct_count ||
        0}
      iconOverwrite="mdiAccountMultiplePlus"
      children={[]}
    />

    {#await pageData.streamed.counters}
      <SidebarHierarchyEntry
        name="PEOPLE_COUNT_UNKNOWN"
        nameOverwrite="Unknown"
        iconOverwrite="mdiAccountQuestion"
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
