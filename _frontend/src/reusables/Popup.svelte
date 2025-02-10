<script lang="ts">
  import { onMount } from "svelte"
  import { fade, scale } from "svelte/transition"

  import Icon from "$components/elements/Icon.svelte"
  import { isMobile } from "$lib/context"

  import { controller, settings } from "../lib/stores.svelte"

  interface Props {
    title?: string
    hideHeader?: boolean
    bottomSheet?: boolean
    fullscreen?: boolean
    onclose?: any
    headerElement?: import("svelte").Snippet
    actionsLeft?: import("svelte").Snippet
    actionsRight?: import("svelte").Snippet
    children?: import("svelte").Snippet
  }

  let {
    title = "",
    hideHeader = false,
    bottomSheet = false,
    fullscreen = false,
    onclose = () => {},
    headerElement,
    actionsLeft,
    actionsRight,
    children
  }: Props = $props()

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key != "Escape") return

    e.preventDefault()
    onclose()
    $controller.setPopup(null)
  }

  onMount(() => {
    window.history.pushState({ popupOpened: true }, "")
  })

  const onPopState = (event: PopStateEvent) => {
    onclose()
    $controller.setPopup(null)
  }
</script>

<svelte:window onkeydown={onKeyDown} onpopstate={onPopState} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main
  transition:fade={{ duration: 100 }}
  onclick={() => {
    onclose()
    $controller.setPopup(null)
  }}
  class:mobile={isMobile.current}
  class:fullscreen
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <section
    transition:scale={{ start: 1.1, duration: 100 }}
    class:bottomSheet
    onclick={e => e.stopPropagation()}
  >
    {#if !hideHeader || isMobile.current}
      <div id="header">
        {#if bottomSheet}
          <!-- svelte-ignore element_invalid_self_closing_tag -->
          <div class="centralBlob" onclick={onclose}></div>
        {:else}
          <h2>{title}</h2>

          {#if headerElement}
            {@render headerElement?.()}
          {/if}

          <button onclick={onclose}>
            <Icon name="mdiClose" />
          </button>
        {/if}
      </div>
    {/if}
    <div id="content" class:hasActions={actionsLeft || actionsRight}>
      {@render children?.()}
    </div>
    {#if actionsLeft || actionsRight}
      <div class="actions">
        {@render actionsLeft?.()}
        <div class="spacer"></div>
        {@render actionsRight?.()}
      </div>
    {/if}
  </section>
</main>

<style lang="scss">
  main {
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100vw;
    height: 100vh;

    background: hsla(0, 0%, 0%, 30%);

    section {
      min-width: 320px;
      max-width: 90%;
      max-height: 90%;

      background: var(--color-dark-level-base);

      #header {
        display: flex;
        gap: 1rem;
        align-items: center;
        padding: 0.5em;

        h2 {
          flex-grow: 1;
          margin: 0 0.2em;
        }

        &:not(:has(.centralBlob)) {
          box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
        }

        .centralBlob {
          width: 48px;
          height: 4px;
          margin: auto;
          margin-top: 4px;
          margin-bottom: 4px;

          opacity: 40%;
          background: hsl(0, 0%, 50%);
          border-radius: 2px;
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

        width: 100vw;
        max-width: 100vw;

        border-right: none;
        border-bottom: none;
        border-left: none;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
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

    &:not(.fullscreen) {
      section {
        border: 1px solid var(--border-color-1);
        border-radius: 0.5em;
        box-shadow:
          rgba(0, 0, 0, 0.3) 0px 3px 9px 0px,
          rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
      }
    }

    &.mobile {
      section {
        display: grid;
        align-content: start;
        align-self: flex-start;

        width: 100vw;
        max-width: 100vw;
        height: calc(100vh - 56px - 2rem);
        max-height: 100vh;
        padding: 1rem;

        border: none;
        border-radius: 0;
        box-shadow: none;

        #content {
          border: none;
        }
      }
    }

    &.fullscreen {
      section {
        display: grid;
        grid-template-rows: auto 1fr;

        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100vh;

        border-radius: 0;
        box-shadow: none;

        #content {
          overflow: auto;
        }
      }
    }
  }
</style>
