<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import { fade, scale } from "svelte/transition"
  import Icon from "$components/Icon.svelte"
  import { controller, settings } from "../lib/stores"

  export let title = ""
  export let hideHeader = false
  export let bottomSheet = false

  const dispatch = createEventDispatcher()

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key != "Escape") return

    e.preventDefault()
    dispatch("close")
    $controller.setPopup(null)
  }

  onMount(() => {
    window.history.pushState({ popupOpened: true }, "")
  })

  const onPopState = (event: PopStateEvent) => {
    dispatch("close")
    $controller.setPopup(null)
  }
</script>

<svelte:window on:keydown={onKeyDown} on:popstate={onPopState} />

<main
  transition:fade={{ duration: 100 }}
  on:click={() => $controller.setPopup(null)}
  class:mobile={$settings.mobileLayout}
>
  <section
    transition:scale={{ start: 1.1, duration: 100 }}
    class:bottomSheet
    on:click|stopPropagation
  >
    {#if !hideHeader || $settings.mobileLayout}
      <div id="header">
        {#if bottomSheet}
          <div class="centralBlob" on:click={() => dispatch("close")} />
        {:else}
          <h2>{title}</h2>

          <button
            on:click={() => {
              dispatch("close")
              $controller.setPopup(null)
            }}
          >
            <Icon name="mdiClose" />
          </button>
        {/if}
      </div>
    {/if}
    <div
      id="content"
      class:hasActions={$$slots.actionsLeft || $$slots.actionsRight}
    >
      <slot />
    </div>
    {#if $$slots.actionsLeft || $$slots.actionsRight}
      <div class="actions">
        <slot name="actionsLeft" />
        <div class="spacer"></div>
        <slot name="actionsRight" />
      </div>
    {/if}
  </section>
</main>

<style lang="scss">
  main {
    position: fixed;
    z-index: 99;

    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background: hsla(0, 0%, 0%, 30%);

    section {
      min-width: 320px;
      max-width: 90%;
      max-height: 90%;

      background: $color-dark-level-base;
      border: 1px solid $border-color-1;
      border-radius: 0.5em;
      box-shadow:
        rgba(0, 0, 0, 0.3) 0px 3px 9px 0px,
        rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;

      #header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5em;

        h2 {
          margin: 0 0.2em;
        }

        &:not(:has(.centralBlob)) {
          box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
        }

        .centralBlob {
          width: 48px;
          height: 4px;
          border-radius: 2px;
          opacity: 40%;
          background: hsl(0, 0%, 50%);
          margin: auto;
          margin-top: 4px;
          margin-bottom: 4px;
        }
      }

      #content {
        padding: 0.5em;

        &.hasActions {
          box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
        }
      }

      &.bottomSheet {
        align-self: flex-end;
        border-bottom: none;
        border-left: none;
        border-right: none;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        width: 100vw;
        max-width: 100vw;
      }

      .actions {
        display: flex;
        justify-content: space-between;
        padding: 0.5em;
        .spacer {
          flex-grow: 1;
        }
      }
    }

    &.mobile {
      section {
        width: 100vw;
        max-width: 100vw;
        // height: 100vh;
        max-height: 100vh;
        border: none;
        display: grid;
        align-content: start;
        #content {
          justify-content: center;
        }
      }
    }
  }
</style>
