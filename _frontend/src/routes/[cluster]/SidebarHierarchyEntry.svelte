<script lang="ts">
  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import tagsController from "$lib/controllers/TagsController.svelte"
  import type { possibleIcons } from "$lib/possibleIcons"
  import { selectedMediaIds } from "$lib/stores"
  import Dropdown from "$reusables/Dropdown.svelte"

  import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"

  let {
    tagId,
    indent = 0,
    nameOverwrite = "",
    iconOverwrite = null
  }: {
    tagId: number
    indent?: number
    nameOverwrite?: string
    iconOverwrite?: keyof typeof possibleIcons | null
  } = $props()

  //   selectedTags.subscribe(tags => {
  //     if (tags.length == 1 && tags.includes(name.toLowerCase())) {
  //       setTimeout(() => {
  //         element?.scrollIntoView({ block: "nearest" })
  //       }, 100)
  //     }
  //   })
  let showDropdown = $state(false)

  const [icon, iconOpacity] = (() => {
    if (iconOverwrite) return [iconOverwrite, 1]
    if (tagsController.tagMap[tagId].icon)
      return [tagsController.tagMap[tagId].icon, 1]
    if (tagsController.tagMap[tagId].indirectIcon)
      return [tagsController.tagMap[tagId].indirectIcon, 0.35]
    if (tagsController.tagMap[tagId].collapsed) return ["mdiFolderHidden", 1]
    return ["mdiFolderOutline", 1]
  })() as any
</script>

<main>
  <Button
    styleOverride="margin-left: {0.75 + indent}em; text-transform: capitalize"
    count={tagsController.tagMap[tagId].count}
    title="Total: {tagsController.tagMap[tagId].count +
      tagsController.tagMap[tagId].indirectCount} (direct count: {tagsController
      .tagMap[tagId].count}, indirect count: {tagsController.tagMap[tagId]
      .indirectCount})"
    {icon}
    {iconOpacity}
    onclick={e => {
      selectedMediaIds.set([])
      if (e.altKey) {
        if (
          mediaController.selectedTags.some(
            t => t.id == tagsController.tagMap[tagId].id
          )
        )
          mediaController.selectedTags = mediaController.selectedTags.filter(
            t => t.id != tagsController.tagMap[tagId].id
          )
        else
          mediaController.selectedTags = [
            ...mediaController.selectedTags,
            tagsController.tagMap[tagId]
          ]
      } else {
        mediaController.selectedTags = [tagsController.tagMap[tagId]]
      }
    }}
    oncontextmenu={e => {
      e.preventDefault()
      showDropdown = !showDropdown
    }}
    onmouseenter={() => mediaController.prefetchMediaForTag(tagId)}
    active={mediaController.selectedTags.some(
      t => t.id == tagsController.tagMap[tagId].id
    )}
  >
    {nameOverwrite || tagsController.tagMap[tagId].tag}
  </Button>

  <Dropdown
    visible={showDropdown}
    top={40}
    left={10}
    right={8}
    position="absolute"
  >
    <Button
      onclick={() => {
        tagsController.toggleTag(
          tagsController.tagMap[tagId],
          collapsed => (
            tagsController.tagMap[tagId],
            (tagsController.tagMap[tagId] = {
              ...tagsController.tagMap[tagId],
              collapsed
            })
          )
        )
        showDropdown = false
      }}
      noMargin
      icon={tagsController.tagMap[tagId].collapsed
        ? "mdiArrowExpandVertical"
        : "mdiArrowCollapseVertical"}
    >
      {tagsController.tagMap[tagId].collapsed ? "Uncollapse" : "Collapse"}
    </Button>
    <Button
      onclick={() => {
        tagsController.createTag(tagsController.tagMap[tagId])
        showDropdown = false
      }}
      noMargin
      icon="mdiTagPlus"
    >
      Create new subtag
    </Button>
  </Dropdown>
</main>

{#if tagsController.tagMap[tagId].children && !tagsController.tagMap[tagId].collapsed}
  {#each tagsController.tagMap[tagId].children
    .map(t => t.id)
    .sort( (a, b) => ($page.params.cluster == "Camp Buddy" ? tagsController.tagMap[b].tag.localeCompare(tagsController.tagMap[a].tag) : tagsController.tagMap[b].count + tagsController.tagMap[b].indirectCount - (tagsController.tagMap[a].count + tagsController.tagMap[a].indirectCount)) ) as c}
    <SidebarHierarchyEntry indent={indent + 1} tagId={c} />
  {/each}
{/if}

<style lang="scss">
  main {
    position: relative;
  }
</style>
