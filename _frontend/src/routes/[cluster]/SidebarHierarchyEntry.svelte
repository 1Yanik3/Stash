<script lang="ts">
  import Button from "$components/Button.svelte"
  import {
    tagsController,
    type TagExtended
  } from "$lib/controllers/TagsController.svelte"
  import type { possibleIcons } from "$lib/possibleIcons"
  import { selectedMediaIds } from "$lib/stores"

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
</script>

<Button
  styleOverride="margin-left: {0.75 + indent}em; text-transform: capitalize"
  count={tag.count}
  icon={iconOverwrite || tag.icon || tag.collapsed
    ? "mdiFolderHidden"
    : "mdiFolderOutline"}
  onclick={e => {
    selectedMediaIds.set([])
    if (e.altKey) {
      if (tagsController.selectedTags.some(t => t.id == tag.id))
        tagsController.selectedTags = tagsController.selectedTags.filter(
          t => t.id != tag.id
        )
      else tagsController.selectedTags = [...tagsController.selectedTags, tag]
    } else {
      tagsController.selectedTags = [tag]
    }
  }}
  oncontextmenu={e => {
    e.preventDefault()
    tagsController.toggleTag(tag, collapsed => (tag = { ...tag, collapsed }))
  }}
  active={tagsController.selectedTags.some(t => t.id == tag.id)}
>
  {nameOverwrite || tag.tag}
</Button>

{#if tag.children && !tag.collapsed}
  {#each tag.children.sort((a, b) => a.tag.localeCompare(b.tag)) as c}
    <svelte:self indent={indent + 1} tag={c} />
  {/each}
{/if}
