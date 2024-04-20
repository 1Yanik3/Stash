<script lang="ts">
  import { controller, settings } from "$lib/stores"

  import FuzzySearch from "fuzzy-search"
  import Popup from "$reusables/Popup.svelte"
  import { createEventDispatcher, onMount } from "svelte"
  import Button from "$components/Button.svelte"

  type T = $$Generic<Record>
  type TAsArray = Array<T>

  export let promise: Promise<TAsArray>
  export let searchAttributes: string[]
  export let disableClose = false
  export let conditionAttribute: keyof T | null = null
  export let placeholder = ""

  let inputBox: HTMLInputElement
  let selectedIndex = 0
  export let value = ""

  let searcher: any = null
  let results: T[]
  $: results =
    (searcher
      ?.search(value)
      .filter((d: any) => typeof d != "string" || d != ".DS_STORE")
      .slice(0, $settings.mobileLayout ? 15 : 10) as T) || []
  $: console.log(results)
  promise.then(data => {
    searcher = new FuzzySearch(
      data.filter(t =>
        conditionAttribute == null ? true : t[conditionAttribute]
      ),
      searchAttributes,
      {
        caseSensitive: false,
        sort: true
      }
    )
  })

  const dispatch = createEventDispatcher<{
    selected: T
    close: void
  }>()

  const onInput = (event: KeyboardEvent) => {
    if (event.key == "ArrowUp") {
      if (selectedIndex > 0) selectedIndex--
    }

    if (event.key == "ArrowDown") {
      if (selectedIndex <= results.length) selectedIndex++
    }

    if (event.key == "Enter") {
      if (!disableClose) {
        dispatch("close")
        $controller.setPopup(null)
      }
      dispatch("selected", results[selectedIndex])
    }
  }

  onMount(() => {
    inputBox.focus()
  })
</script>

<Popup on:close={() => dispatch("close")} hideHeader>
  <main>
    <input
      type="search"
      bind:value
      on:keydown={e => onInput(e)}
      bind:this={inputBox}
      {placeholder}
    />

    {#each results as result, i}
      <div
        class:active={i == selectedIndex}
        on:click={() => {
          if (!disableClose) {
            dispatch("close")
            $controller.setPopup(null)
          }
          dispatch("selected", results[i])
        }}
      >
        <slot {result} />
      </div>
    {/each}

    {#if $settings.mobileLayout}
      <div class="mobileNavigationButtons">
        <Button
          card
          icon="mdiArrowUp"
          on:click={() => {
            if (selectedIndex > 0) selectedIndex--
          }}
        />
        <Button
          card
          icon="mdiArrowDown"
          on:click={() => {
            if (selectedIndex <= results.length) selectedIndex++
          }}
        />
        <Button
          card
          icon="mdiKeyboardReturn"
          on:click={() => {
            if (!disableClose) {
              dispatch("close")
              $controller.setPopup(null)
            }
            dispatch("selected", results[selectedIndex])
          }}
        />
      </div>
    {/if}
  </main>
</Popup>

<style lang="scss">
  main {
    display: grid;
    max-width: 100%;

    input {
      margin-bottom: 1em;
      padding: 0.5em;
    }

    div {
      display: flex;
      justify-content: space-between;

      margin: 0 0.15em;
      padding: 0.4em;

      background: transparent;
      border: 1px solid transparent;
      border-radius: 0.35em;

      transition: background 150ms;

      &.active {
        background: #303030;
        border: 1px solid hsl(0, 0%, 24%);
      }

      &.mobileNavigationButtons {
        position: absolute;
        right: 10px;
        bottom: 10px;

        background: hsl(0, 0%, 9%);
        border: 1px solid hsl(0, 0%, 15%);
      }
    }
  }
</style>
