<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte"

  import { page } from "$app/stores"
  import Icon from "$components/elements/Icon.svelte"
  import Key from "$components/elements/Key.svelte"
  import type { possibleIcons } from "$lib/possibleIcons"
  import Shortcut from "$reusables/Shortcut.svelte"

  let isDraggingOver = false

  let {
    icon = null as keyof typeof possibleIcons | null,
    iconNoTyping = null as string | null,
    iconOpacity = 1,
    count = null as number | null,
    active = false,
    href = null as string | null,
    shortcut = null as {
      modifier: string
      key: string
    } | null,
    hidden = false,
    right = false,
    card = false,
    highlighted = false,
    disabled = false,
    noMargin = false,
    styleOverride = "",
    download = null as null | true,
    transparentButton = false,
    title = null as null | string,
    oncontextmenu = (() => {}) as (e: MouseEvent) => void,
    onclick = (() => {}) as (e: MouseEvent) => void,
    onmouseenter = (() => {}) as (e: MouseEvent) => void,
    children = null
  } = $props()

  //   export let tooltip: any = {
  //     title: "",
  //     position: "bottom",
  //     enabled: false
  //   }

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
  {download}
  {href}
  style={styleOverride}
  class:active={active || (href && href == $page.url.pathname)}
  class:hidden={hidden || !children}
  class:right
  class:highlighted
  class:noMargin
  class:transparentButton
  {oncontextmenu}
  {onclick}
  {onmouseenter}
  class:isDraggingOver
  class:card
  class:disabled
  {title}
>
  <div class="section">
    {#if (icon || iconNoTyping) != null}
      <!-- @ts-ignore -->
      <Icon
        nameAlt={icon || iconNoTyping || "mdiHelp"}
        size={"1.25em"}
        opacity={iconOpacity}
      />
    {/if}
    {#if children}
      <span>
        {@render (children as Snippet)()}
      </span>
    {/if}
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
  <Shortcut modifier={shortcut.modifier as any} key={shortcut.key} action={onclick} />
{/if}

<style lang="scss">
  @use "sass:color";

  a {
    cursor: pointer;
    user-select: none;

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;

    padding: 0.5em 0.75em;

    text-decoration: none;

    border: 1px solid transparent;
    border-radius: 0.35em;

    transition:
      background 100ms,
      border 100ms,
      transform 200ms;

    -webkit-app-region: no-drag;
    -webkit-tap-highlight-color: transparent;

    &:not(.noMargin) {
      margin: 0.15em 0.5em;
    }

    &.card {
      margin: 0.25em;
      background: var(--color-dark-level-2);
      border: 1px solid var(--border-color-1);

      &:hover {
        background: var(--color-dark-level-2-hover) !important;
        border: 1px solid var(--border-color-1-hover) !important;
      }
    }

    &.disabled {
      pointer-events: none;
      opacity: 75%;
    }

    &.active {
      background: var(--color-dark-level-2);
      border: 1px solid var(--border-color-1);

      &:hover {
        background: var(--color-dark-level-2-hover);
        border: 1px solid var(--border-color-1-hover);
      }
    }

    &.highlighted {
      background: var(--color-dark-level-3);
      border: 1px solid var(--border-color-1);

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          background: var(--color-dark-level-2-hover);
          border: 1px solid var(--border-color-1-hover);
        }
      }
    }

    &.isDraggingOver {
      background: var(--color-dark-level-2-hover);
      border: 1px solid var(--border-color-1-hover);
    }

    .section {
      display: grid;
      grid-auto-flow: column;
      align-items: center;

      span {
        overflow: hidden;

        margin-left: 0.35em;

        font-weight: 300;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.hidden {
      align-items: center;
      justify-content: center;

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
        &:not(.transparentButton) {
          background: var(--color-dark-level-2);
          border: 1px solid var(--border-color-1);
        }

        &.transparentButton {
          transform: scale(1.1);
        }
      }
    }
  }
</style>
