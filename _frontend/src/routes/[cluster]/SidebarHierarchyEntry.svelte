<script lang="ts">
  import Button from "$components/Button.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import {
    tagsController,
    type TagExtended
  } from "$lib/controllers/TagsController.svelte"
  import type { possibleIcons } from "$lib/possibleIcons"
  import { selectedMediaIds } from "$lib/stores"
  import Dropdown from "$reusables/Dropdown.svelte"

  let {
    tag,
    indent = 0,
    nameOverwrite = "",
    iconOverwrite = null
  }: {
    tag: TagExtended
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
</script>

<main>
  <Button
    styleOverride="margin-left: {0.75 + indent}em; text-transform: capitalize"
    count={tag.count + tag.indirectCount}
    icon={iconOverwrite ||
      tag.icon ||
      (tag.collapsed ? "mdiFolderHidden" : "mdiFolderOutline")}
    onclick={e => {
      selectedMediaIds.set([])
      if (e.altKey) {
        if (mediaController.filters.selectedTags.some(t => t.id == tag.id))
          mediaController.filters.selectedTags =
            mediaController.filters.selectedTags.filter(t => t.id != tag.id)
        else
          mediaController.filters.selectedTags = [
            ...mediaController.filters.selectedTags,
            tag
          ]
      } else {
        mediaController.filters.selectedTags = [tag]
      }
    }}
    oncontextmenu={e => {
      e.preventDefault()
      showDropdown = !showDropdown
    }}
    active={mediaController.filters.selectedTags.some(t => t.id == tag.id)}
  >
    {nameOverwrite || tag.tag}
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
          tag,
          collapsed => (tag = { ...tag, collapsed })
        )
        showDropdown = false
      }}
      noMargin
      icon={tag.collapsed
        ? "mdiArrowExpandVertical"
        : "mdiArrowCollapseVertical"}
    >
      {tag.collapsed ? "Uncollapse" : "Collapse"}
    </Button>
    <Button
      onclick={() => {
        tagsController.createTag(tag)
        showDropdown = false
      }}
      noMargin
      icon="mdiTagPlus"
    >
      Create new subtag
    </Button>
  </Dropdown>
</main>

{#if tag.children && !tag.collapsed}
  {#each tag.children.sort((a, b) => a.tag.localeCompare(b.tag)) as c}
    <svelte:self indent={indent + 1} tag={c} />
  {/each}
{/if}

<style lang="scss">
  main {
    position: relative;
  }
</style>
