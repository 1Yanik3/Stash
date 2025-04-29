<script lang="ts">
  import { page } from "$app/state"
  import TagsController from "$lib/controllers/TagsController.svelte"
  import { controller } from "$lib/stores.svelte"

  import SidebarHierarchyEntry from "../routes/[cluster]/SidebarHierarchyEntry.svelte"
  import Button from "./elements/Button.svelte"

  let isDragging = $state(false)
  let startY = $state(0)
  let startHeight = $state(0)
  let contentHeight = $state(0)
  let contentElement: HTMLElement
  let windowHeight = $state(0)
  let innerHeight = $derived(windowHeight - 96)
  let startedAtTop = $state(false)

  function startDrag(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement
    if (target.closest("a")) return

    event.preventDefault()
    isDragging = true

    // Get initial Y position based on input type
    if (event instanceof TouchEvent) {
      startY = event.touches[0].clientY
    } else {
      startY = event.clientY
    }

    startHeight = contentHeight
    startedAtTop = contentHeight === innerHeight

    // Add appropriate event listeners
    if (event instanceof TouchEvent) {
      window.addEventListener("touchmove", handleDrag, { passive: false })
      window.addEventListener("touchend", stopDrag)
    } else {
      window.addEventListener("mousemove", handleDrag)
      window.addEventListener("mouseup", stopDrag)
    }
  }

  function handleDrag(event: MouseEvent | TouchEvent) {
    if (!isDragging) return

    // Prevent default touch behavior
    if (event instanceof TouchEvent) {
      event.preventDefault()
    }

    // Get current Y position based on input type
    const currentY =
      event instanceof TouchEvent ? event.touches[0].clientY : event.clientY

    const deltaY = startY - currentY // Inverted for natural dragging
    let newHeight = startHeight + deltaY

    // Keep height within bounds
    newHeight = Math.max(0, Math.min(innerHeight, newHeight))
    contentHeight = newHeight
  }

  function stopDrag() {
    isDragging = false

    // Snap to nearest position
    if (startedAtTop) {
      contentHeight = contentHeight > window.innerHeight * 0.8 ? innerHeight : 0
    } else {
      contentHeight = contentHeight > window.innerHeight * 0.2 ? innerHeight : 0
    }

    // Clean up all event listeners
    window.removeEventListener("mousemove", handleDrag)
    window.removeEventListener("mouseup", stopDrag)
    window.removeEventListener("touchmove", handleDrag)
    window.removeEventListener("touchend", stopDrag)
  }
</script>

<svelte:window bind:innerHeight={windowHeight} />

<main>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="always-visible" onmousedown={startDrag} ontouchstart={startDrag}>
    <div class="drag-region">
      <div class="dragger"></div>
    </div>
    <div class="buttons">
      {#each page.data.clusters as cluster}
        <Button
          size="large"
          active={page.url.pathname.includes(cluster.name)}
          card
          icon={cluster.icon}
          href="/{cluster.name}"
          styleOverride="padding: 0.75rem; --outline-size: 3px; --border-radius: 13px"
        />
      {/each}
      <div class="spacer"></div>
      <Button
        size="large"
        active={page.url.pathname.includes("settings")}
        card
        icon="mdiCog"
        href="/settings/general"
        oncontextmenu={e => {
          e.preventDefault()
          $controller.setPopup("Quick Switch")
        }}
        styleOverride="padding: 0.75rem; --outline-size: 3px; --border-radius: 13px"
      />
    </div>
  </div>
  <div
    class="content-out-of-view"
    bind:this={contentElement}
    style="height: {contentHeight}px"
  >
    {#each Object.values(TagsController.tagMap)
      .filter(t => !t.parentId)
      .sort( (a, b) => (page.params.cluster == "Camp Buddy" ? b.tag.localeCompare(a.tag) : b.count + b.indirectCount - (a.count + a.indirectCount)) ) as tag}
      <SidebarHierarchyEntry tagId={tag.id} />
    {/each}
  </div>
</main>

<style lang="scss">
  main {
    display: grid;
    gap: 0.5rem;

    padding: 0.5rem;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;

    background-color: var(--accent-background);

    .always-visible {
      display: grid;
      gap: 0.5rem;

      .drag-region {
        cursor: ns-resize;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: 10px;

        -webkit-app-region: drag;

        .dragger {
          width: 30px;
          height: 4px;
          border-radius: 2px;
          background: #777;
        }
      }

      .buttons {
        display: flex;

        .spacer {
          flex-grow: 1;
        }
      }
    }

    .content-out-of-view {
      overflow: scroll;
    }
  }
</style>
