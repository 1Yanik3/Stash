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
  {#if mediaController.filters.selectedTags.length}
    <Button
      noMargin
      icon="mdiBackspace"
      onclick={() => {
        mediaController.filters.selectedTags = []
      }}
    >
      Clear Tag Selection
    </Button>
  {/if}

  <Button
    noMargin
    icon={mediaController.filters.favouritesOnly ? "mdiStar" : "mdiStarOutline"}
    onclick={() => {
      mediaController.filters.favouritesOnly =
        !mediaController.filters.favouritesOnly
    }}
  >
    Favourited
  </Button>

  <Select
    large
    width={175}
    bind:value={mediaController.filters.activeSortingMethod}
    options={sortingMethods.map((method, i) => ({
      value: i,
      name: method.title,
      icon: method.icon
    }))}
    oncontextmenu={e => {
      e.preventDefault()
      mediaController.filters.seed = Math.random()
    }}
  />

  <!-- TODO: Make dynamic -->
  <!-- TODO: Move to dropdown rather than select -->
  {#if pageData.cluster.id == 2 || pageData.cluster.id == 6}
    <Select
      large
      width={110}
      bind:value={mediaController.filters.specialFilterAttribute}
      options={[
        { value: null, name: "People: All" },
        { value: "solo", name: "Solo", icon: "mdiAccount" },
        { value: "two", name: "Two", icon: "mdiAccountMultiple" },
        { value: "three", name: "Three", icon: "mdiAccountGroup" },
        { value: "group", name: "Group", icon: "mdiAccountMultiplePlus" },
        { value: "show_unknown", name: "Unknown", icon: "mdiAccountQuestion" }
      ]}
    />
  {/if}

  <Select
    large
    width={175}
    bind:value={mediaController.filters.countOfTags}
    options={[
      { value: -1, name: "Number of Tags", icon: "mdiAllInclusive" },
      { value: 0, name: "Number of Tags", icon: "mdiNumeric0" },
      { value: 1, name: "Number of Tags", icon: "mdiNumeric1" },
      { value: 2, name: "Number of Tags", icon: "mdiNumeric2" },
      { value: 3, name: "Number of Tags", icon: "mdiNumeric3" }
    ]}
  />

  <Select
    large
    width={175}
    bind:value={mediaController.filters.minResolution}
    options={[
      { value: null, name: "Minimum Resolution", icon: "mdiAllInclusive" },
      { value: 720, name: "720p", icon: "mdiStandardDefinition" },
      { value: 1080, name: "1080p", icon: "mdiHighDefinition" },
      { value: 2160, name: "2160p", icon: "mdiVideo4kBox" },
    ]}
  />

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
