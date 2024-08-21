<script lang="ts">
  import { readable } from "svelte/store"

  import Button from "$components/Button.svelte"
  import { collapsedTagsController } from "$lib/controllers/CollapsedTagsController"
  import getIconForTagName from "$lib/getIconForTagName"
  import type { possibleIcons } from "$lib/possibleIcons"
  import {
    collapsedTags,
    controller,
    selectedMediaIds,
    selectedTags
  } from "$lib/stores"

  type TagData = {
    name: string
    count: number
    children: TagData
  }[]

  let {
    name,
    count = null,
    children,
    indent = 0,
    nameOverwrite = "",
    iconOverwrite = null
  }: {
    name: string
    count?: number | null
    children: TagData
    indent?: number
    nameOverwrite?: string
    iconOverwrite?: keyof typeof possibleIcons | null
  } = $props()

  let collapsed = $derived($collapsedTags.includes(name.toLowerCase()))
  let icon = $derived(
    iconOverwrite ? readable(iconOverwrite) : getIconForTagName(name)
  )

  //   selectedTags.subscribe(tags => {
  //     if (tags.length == 1 && tags.includes(name.toLowerCase())) {
  //       setTimeout(() => {
  //         element?.scrollIntoView({ block: "nearest" })
  //       }, 100)
  //     }
  //   })
</script>

<Button
  {indent}
  {count}
  icon={$icon}
  onclick={e => {
    // @ts-ignore
    if (e.detail.altKey) {
      if ($selectedTags.includes(name.toLowerCase()))
        selectedTags.set($selectedTags.filter(t => t != name.toLowerCase()))
      else selectedTags.set([...$selectedTags, name.toLowerCase()])
    } else {
      selectedTags.set([name.toLowerCase()])
      selectedMediaIds.set([])
    }
  }}
  oncontextmenu={e => {
    e.preventDefault()
    collapsedTagsController.toggleCollapsedTag(name.toLowerCase())
  }}
  active={$selectedTags.includes(name.toLowerCase())}
>
  {(nameOverwrite || name).replace(/.+\//, "")}
</Button>

{#if children && !collapsed}
  {#each children.sort((a, b) => a.name.localeCompare(b.name)) as c}
    <svelte:self
      indent={indent + 1}
      name={name + "/" + c.name}
      count={c.count}
      children={c.children}
    />
  {/each}
{/if}
