<script lang="ts">
  import { createEventDispatcher, type ComponentProps } from "svelte"
  import Icon from "$components/Icon.svelte"
  import type { possibleIcons } from "$lib/possibleIcons"
  import { page } from "$app/stores"
  import Key from "$components/Key.svelte"
  import Shortcut from "$reusables/Shortcut.svelte"
  import { tooltip as tooltip_function } from "$reusables/tooltip"

  let isDraggingOver = false

  // @ts-ignore
  export let element: HTMLAnchorElement = null

  export let icon: keyof typeof possibleIcons | null = null
  export let iconNoTyping: string | null = null
  export let indent: number = 0
  export let count: number | "" | null = null
  export let active: boolean = false
  export let href: string | null = null
  export let shortcut: {
    modifier: Exclude<
      Exclude<ComponentProps<Shortcut>["modifier"], null>,
      undefined
    >
    key: string
  } | null = null

  export let hidden = false
  export let right = false
  export let card = false
  export let highlighted = false
  export let disabled = false
  export let noMargin = false
  export let styleOverride: string = ""

  export let tooltip: Parameters<typeof tooltip_function>[1] = {
    title: "",
    position: "bottom",
    enabled: false
  }

  const dispatch = createEventDispatcher()

  //#region Handle Drag (for moving media)

  const isFileTransfer = (e: DragEvent) =>
    e.dataTransfer?.types.includes("Files")

  // TODO
  // const handleDrop = (e: DragEvent) => {
  //     const items = e.dataTransfer?.items
  //     if (!items) return

  //     for (const i in items) {
  //         const item = items[i]
  //         if (item.type == "text/plain") item.getAsString(async mediaId => {

  //             if (mediaId.startsWith("mediaId_")) {

  //                 mediaId = mediaId.replace("mediaId_", "")

  //                 const response = await fetch(`/api/media/${mediaId}/group`, {
  //                     method: 'PUT',
  //                     body: JSON.stringify({
  //                         groupId: target?.id
  //                     })
  //                 })

  //                 // TODO ?
  //                 if (response.ok)
  //                     invalidateAll()
  //                 else
  //                     window.alert("Something wen't wrong moving media")

  //             }

  //         })
  //     }

  //     isDraggingOver = false
  // }
  // const handleEnter = (e: DragEvent) => {
  //     if (isFileTransfer(e)) return

  //     isDraggingOver = true
  // }
  // const handleLeave = (e: DragEvent) => {
  //     isDraggingOver = false
  // }

  //#endregion
</script>

<!-- TODO: Maybe we can get rid of the href? -->
<a
  bind:this={element}
  {href}
  style={`padding-left: ${0.75 + indent}em;${styleOverride}`}
  class:active={active || (href && href == $page.url.pathname)}
  class:hidden={hidden || !$$slots.default}
  class:right
  class:highlighted
  class:noMargin
  on:contextmenu={e => {
    dispatch("contextmenu", e)
  }}
  on:click={e => {
    console.time("navigation")
    dispatch("click", e)
    // TODO
    // if (tag) {
    //     // is a tag button

    //     if (tag.name == "Untagged")
    //         pageData.tags.filter(t => t.name != "Untagged").forEach(t => t.active = false)
    //     else
    //         // @ts-ignore
    //         pageData.tags.find(t => t.name == "Untagged").active = false

    //     const tmp = pageData.tags.find(t => t == tag)
    //     if (tmp)
    //         tmp.active = !tag.active

    // }
  }}
  on:dblclick={e => {
    dispatch("dblclick", e)
  }}
  class:isDraggingOver
  class:card
  class:disabled
  use:tooltip_function={tooltip}
>
  <div class="section">
    {#if (icon || iconNoTyping) != null}
      <!-- @ts-ignore -->
      <div class="spacer">
        <Icon nameAlt={icon || iconNoTyping || "mdiHelp"} size={"1.25em"} />
      </div>
    {/if}
    <span>
      <slot />
    </span>
    {#if shortcut}
      <div style="display: flex;margin-left: 5px">
        <Key compact key={shortcut.modifier} />
        <Key compact key={shortcut.key} />
      </div>
    {/if}
  </div>

  {#if count}
    <div class="section" style="filter: opacity(0.6)">
      <span>{count}</span>
    </div>
  {/if}
</a>

{#if shortcut}
  <Shortcut
    modifier={shortcut.modifier}
    key={shortcut.key}
    action={() => dispatch("click")}
  />
{/if}

<style lang="scss">
  @use "sass:color";

  a {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0.5em 0.75em;

    font-weight: 200;
    text-decoration: none;

    border: 1px solid transparent;
    border-radius: 0.35em;

    transition:
      background 100ms,
      border 100ms;

    -webkit-app-region: no-drag;
    -webkit-tap-highlight-color: transparent;

    &:not(.noMargin) {
      margin: 0.15em 0.5em;
    }

    &.card {
      margin: 0.25em;
      background: hsl(0, 0%, 13%);
      border: 1px solid hsl(0, 0%, 24%);
    }

    &.disabled {
      pointer-events: none;
      opacity: 75%;
    }

    &.active {
      background: $color-dark-level-2;
      border: 1px solid $border-color-1;

      &:hover {
        background: color.adjust($color-dark-level-2, $lightness: 2%);
        border: 1px solid color.adjust($border-color-1, $lightness: 2%);
      }
    }

    &.highlighted {
      background: $color-dark-level-3;
      border: 1px solid $border-color-1;

      @media (hover: hover) and (pointer: fine) {

        &:hover {
          background: color.adjust($color-dark-level-3, $lightness: 2%);
          border: 1px solid color.adjust($border-color-1, $lightness: 2%);
        }
      }
    }

    &.isDraggingOver {
      background: color.adjust($color-dark-level-2, $lightness: 2%);
      border: 1px solid color.adjust($border-color-1, $lightness: 2%);
    }

    .section {
      display: grid;
      grid-auto-flow: column;
      align-items: center;

      .spacer {
        margin-right: 0.35em;
      }

      span {
        overflow: hidden;
        font-weight: 200;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.hidden {
      align-items: center;
      justify-content: center;

      .section {

        .spacer {
          margin-right: unset;
        }
      }

      span {
        display: none;
      }
    }

    &.right {

      &,
      .section {
        flex-direction: row-reverse;
      }
    }

    @media (hover: hover) and (pointer: fine) {

      &:hover {
        background: $color-dark-level-2;
        border: 1px solid $border-color-1;
      }
    }
  }
</style>
