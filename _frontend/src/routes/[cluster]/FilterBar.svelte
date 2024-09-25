<script lang="ts">

  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import Select from "$components/Select.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"

  import { sortingMethods } from "../../types"
  import type { PageData } from "./$types"

  $: pageData = $page.data as PageData
</script>

<!-- <SidebarSection horizontal>
  

<!-- <Button
    hidden
    icon="mdiTrashCanOutline"
    onclick={() => {
      selectedTags.set(["SHOW_TRASHED"])
    }}
    active={mediaController.filters.selectedTags[0] == "SHOW_TRASHED"}
  >
    Trashed
  </Button> -->
<!-- </SidebarSection> -->

<!-- {#if $mediaTypeFilter == ""}
    <Button
      icon="mdiMultimedia"
      onclick={() => {
        mediaTypeFilter.set("image")
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
    >
      Image
    </Button>
  {:else if $mediaTypeFilter == "video"}
    <Button
      icon="mdiVideoOutline"
      onclick={() => {
        mediaTypeFilter.set("")
      }}
    >
      Image
    </Button>
  {/if} -->

<!-- <Button
    icon={mediaController.filters.favouritesOnly ? "mdiStar" : "mdiStarOutline"}
    onclick={() => {
      mediaController.filters.favouritesOnly =
        !mediaController.filters.favouritesOnly
    }}
  >
    Favourited
  </Button>
</SidebarSection> -->

<main>
  <Button
    noMargin
    icon="mdiBookshelf"
    onclick={() => {
      mediaController.filters.selectedTags = []
    }}
    active={mediaController.filters.selectedTags.length == 0}
  >
    All
  </Button>

  <Button
    icon={mediaController.filters.favouritesOnly ? "mdiStar" : "mdiStarOutline"}
    onclick={() => {
      mediaController.filters.favouritesOnly =
        !mediaController.filters.favouritesOnly
    }}
  >
    Favourited
  </Button>

  <Button
    noMargin
    disabled={["collection", "stories"].includes(pageData.cluster?.type)}
    onclick={() => {
      mediaController.filters.activeSortingMethod =
        (mediaController.filters.activeSortingMethod + 1) %
        sortingMethods.length
    }}
    oncontextmenu={e => {
      e.preventDefault()
      mediaController.filters.seed = Math.random()
    }}
    icon={sortingMethods[mediaController.filters.activeSortingMethod].icon}
  >
    Sorting Method
  </Button>

  <!-- TODO: Make dynamic -->
  <!-- TODO: Move to dropdown rather than select -->
  {#if pageData.cluster.id == 2 || pageData.cluster.id == 6}
    <Select
      bind:value={mediaController.filters.specialFilterAttribute}
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

  <Button
    noMargin
    icon={mediaController.filters.countOfTags == 0
      ? "mdiNumeric0"
      : mediaController.filters.countOfTags == 1
        ? "mdiNumeric1"
        : mediaController.filters.countOfTags == 2
          ? "mdiNumeric2"
          : mediaController.filters.countOfTags == 3
            ? "mdiNumeric3"
            : "mdiAllInclusive"}
    onclick={() => {
      if (mediaController.filters.countOfTags < 3) {
        mediaController.filters.countOfTags++
      } else {
        mediaController.filters.countOfTags = -1
      }
    }}
    active={mediaController.filters.countOfTags != -1}
  >
    Number of Tags
  </Button>

  <!-- <Button
    noMargin
    disabled={pageData.cluster?.type == "stories"}
    onclick={() => {
      traverse.set(!$traverse)
    }}
    icon={$traverse ? "mdiHook" : "mdiHookOff"}
  >
    Traverse
  </Button>

  <Button
    noMargin
    disabled={["collection", "stories"].includes(pageData.cluster?.type)}
    onclick={() => {
      activeSetMethod.set(
        setMethods[
          (setMethods.indexOf($activeSetMethod) + 1) % setMethods.length
        ]
      )
    }}
    icon={$activeSetMethod.icon}
  >
    Set Method ({$activeSetMethod.title})
  </Button> -->
</main>

<style lang="scss">
  main {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    height: 51.75px;

    background: var(--color-dark-level-1);
    border-bottom: 1px solid var(--border-color-base);

    -webkit-app-region: drag;
  }
</style>
