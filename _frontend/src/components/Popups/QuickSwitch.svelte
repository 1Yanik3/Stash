<script lang="ts">
  import { onMount } from "svelte"

  import Icon from "$components/Icon.svelte"
  import { refreshFilters } from "$lib/client/QuickSwitchHelpers/filters.svelte"
  import {
    executeSearch,
    updateSearcher,
    type ResultsType
  } from "$lib/client/QuickSwitchHelpers/search.svelte"
  import { controller } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"

  let value = $state("")
  let selectedIndex = $state(0)
  let submenuOverwrite: ResultsType = $state([])
  const results = $derived(executeSearch(value))

  onMount(() => {
    refreshFilters()
    const input = document.getElementById(
      "quick-switch-input"
    ) as HTMLInputElement
    input.focus()
  })
</script>

<Popup hideHeader onclose={() => $controller.setPopup(null)}>
  <main>
    <input
      id="quick-switch-input"
      type="search"
      placeholder="Search for #tags, @filters, !clusters, or /commands"
      bind:value
      autocomplete="off"
      onkeydown={(e: KeyboardEvent) => {
        const selected = (submenuOverwrite.length ? submenuOverwrite : results)[
          selectedIndex
        ]
        if (e.key == "ArrowUp") {
          if (selectedIndex > 0) selectedIndex--
        } else if (e.key == "ArrowDown") {
          if (selectedIndex <= results.length) selectedIndex++
        } else if (e.key == "Enter") {
          if (selected.onEnter) {
            selected.onEnter(e)
          } else if (selected.submenu) {
            submenuOverwrite = selected.submenu
          }
        } else if (e.key == "Tab") {
          e.preventDefault()
          if (selected.submenu) {
            submenuOverwrite = selected.submenu
          }
        } else if (e.key == "Backspace" && submenuOverwrite.length) {
          submenuOverwrite = []
          e.preventDefault()
        } else {
          selectedIndex = 0
        }
      }}
    />
    <div class="search-result-section">
      {#each submenuOverwrite.length ? submenuOverwrite : results as result, i}
        <div class="result-row" class:selected={selectedIndex == i}>
          <div class="icon">
            <Icon name={result.icon} size={0.8} />
          </div>
          <span class="label">
            {result.label}{#if result.submenu}
              /...
            {/if}
          </span>
          {#if result.action}
            <div class="action">{result.action}</div>
          {/if}
        </div>
      {/each}
    </div>
    <!-- <div class="currently-selected-section">
      <div class="badge">
        <Icon name="mdiTag" size={0.8} />
        <span>#pet/cats</span>
      </div>
    </div> -->
  </main>
</Popup>

<style lang="scss">
  main {
    display: grid;
    gap: 1rem;
    min-width: 450px;

    input {
      margin: -0.5rem;
      margin-bottom: 0;
      padding: 0.5rem;

      font-size: 1rem;

      border: none;
      border-bottom: 1px solid var(--border-color-1);
    }

    .search-result-section {
      display: grid;
      gap: 0.5rem;

      .result-row {
        display: flex;
        gap: 0.5rem;
        padding: 0.25rem;
        border-radius: 0.25rem;

        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
        }

        .label {
          display: flex;
          flex-grow: 1;
          align-items: center;
        }

        .action {
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0.25rem 0.5rem;

          font-size: 14px;

          background-color: var(--color-dark-level-3);
          border-radius: 0.5rem;
        }

        &.selected {
          background-color: var(--color-dark-level-2);
          outline: 1px solid var(--border-color-1);
        }
      }
    }

    .currently-selected-section {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem;
      padding-top: 0;

      .badge {
        display: flex;
        align-items: center;

        padding: 0.25rem 0.5rem;

        background-color: var(--color-dark-level-2);
        border: 1px solid var(--border-color-1);
        border-radius: 0.5rem;

        span {
          margin-left: 0.5rem;
        }
      }
    }
  }
</style>
