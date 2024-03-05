<script lang="ts">
  import { page } from "$app/stores"
  import { selectedMediaIds, selectedTags } from "$lib/stores"
  import type { possibleIcons } from "$lib/possibleIcons"
  import type { PageData } from "./$types"
  import SidebarButton from "./SidebarButton.svelte"
  import { invalidate } from "$app/navigation"
  import { onMount } from "svelte"

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

  export let collapsed: boolean | null = null
  onMount(() => {
    // TODO: Test
    if (collapsed == null) {
      ;($page.data as PageData).streamed.collapsedTags.then(collapsedTags => {
        collapsed = collapsedTags.some(t => t.tag == name.toLowerCase())
      })
    }
  })

  let element: HTMLAnchorElement

  selectedTags.subscribe(tags => {
    if (tags.length == 1 && tags.includes(name.toLowerCase())) {
      setTimeout(() => {
        element?.scrollIntoView({ block: "nearest" })
      }, 100)
    }
  })

  $: icon =
    iconOverwrite ||
    (($page.data as PageData).tagIcons.find(
      t =>
        t.tag == name.toLowerCase() ||
        name.toLowerCase().substring(name.toLowerCase().lastIndexOf("/") + 1) ==
          t.tag
    )?.icon as keyof typeof possibleIcons)
</script>

<SidebarButton
  {indent}
  {count}
  icon={icon ? icon : collapsed ? "mdiFolderHidden" : "mdiFolderOutline"}
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

    if (collapsed) {
      collapsed = false
      fetch(`/api/cluster/${$page.data.cluster.name}/tags/collapsed`, {
        method: "DELETE",
        body: JSON.stringify({ tag: name.toLowerCase() })
      }).then(() => {
        invalidate("tags")
      })
    } else {
      collapsed = true
      fetch(`/api/cluster/${$page.data.cluster.name}/tags/collapsed`, {
        method: "POST",
        body: JSON.stringify({ tag: name.toLowerCase() })
      }).then(() => {
        invalidate("tags")
      })
    }
  }}
  active={$selectedTags.includes(name.toLowerCase())}
  bind:element
>
  {nameOverwrite.replace(/.+\//, "")}
</SidebarButton>

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
