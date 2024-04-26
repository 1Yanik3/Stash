<script lang="ts">
  import {
    collapsedTags,
    controller,
    selectedMediaIds,
    selectedTags
  } from "$lib/stores"
  import type { possibleIcons } from "$lib/possibleIcons"
  import Button from "$components/Button.svelte"
  import getIconForTagName from "$lib/getIconForTagName"
  import { readable } from "svelte/store"

  type TagData = {
    name: string
    count: number | ""
    children: TagData
  }[]

  export let name: string
  export let count: number | ""
  export let children: TagData
  export let indent = 0
  export let nameOverwrite = name
  export let iconOverwrite: keyof typeof possibleIcons | null = null

  $: collapsed = $collapsedTags.includes(name.toLowerCase())

  let element: HTMLAnchorElement

  selectedTags.subscribe(tags => {
    if (tags.length == 1 && tags.includes(name.toLowerCase())) {
      setTimeout(() => {
        element?.scrollIntoView({ block: "nearest" })
      }, 100)
    }
  })

  let icon = iconOverwrite ? readable(iconOverwrite) : getIconForTagName(name)
</script>

<Button
  {indent}
  {count}
  icon={$icon}
  on:click={e => {
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
  on:contextmenu={({ detail }) => {
    detail.preventDefault()
    $controller.collapsedTagsController.toggleCollapsedTag(name.toLowerCase())
  }}
  active={$selectedTags.includes(name.toLowerCase())}
  bind:element
>
  {nameOverwrite.replace(/.+\//, "")}
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
