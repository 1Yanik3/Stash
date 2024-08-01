<script lang="ts">
  import Dropdown from "$reusables/Dropdown.svelte"

  import Button from "./Button.svelte"
  import Icon from "./Icon.svelte"

  type T = $$Generic<Record>

  export let options: { value: T; name: string | undefined }[]
  export let value: T = options[0].value
  export let width = 150

  let main: HTMLElement
  let open = false
  let top = 0
  let left = 0
</script>

<main
  bind:this={main}
  on:click={() => {
    const rect = main.getBoundingClientRect()
    top = rect.bottom + 4
    left = rect.left
    open = !open
  }}
  style:min-width="{width - 10.5}px"
>
  <span>{options.find(o => o.value == value)?.name || value}</span>
  <div class="arrow">
    <Icon size={0.8} name="mdiChevronDown" />
  </div>
</main>

{#if open}
  <div
    class="options"
    style:top="{top}px"
    style:left="{left}px"
    style:width="{width}px"
  >
    {#each options as o}
      <span
        class:active={o.value === value}
        on:mousedown={() => {
          value = o.value
          open = false
        }}
      >
        {o.name}
      </span>
    {/each}
  </div>
{/if}

<style lang="scss">
  $padding: 4.25px;

  main {
    cursor: pointer;

    position: relative;

    width: max-content;
    padding: $padding;

    font-size: 14px;
    font-weight: 200;

    background: var(--color-dark-level-base);
    border: 1px solid var(--border-color-base);
    border-radius: 3px;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

    transition: all 200ms ease;

    .arrow {
      position: absolute;
      top: 50%;
      right: 5px;
      transform: translateY(-50%);
    }

    @media (hover: hover) and (pointer: fine) {

      &:hover {
        filter: brightness(110%);
      }
    }
  }

  .options {
    position: absolute;
    z-index: 999;

    display: grid;

    background: var(--color-dark-level-base);
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

    span {
      margin-top: 1px;
      padding: 5px;
      outline: 1px solid var(--border-color-base);

      &:hover {
        background: var(--color-dark-level-2);
        outline: 1px solid var(--border-color-1);
      }

      &.active {
        z-index: 1;
        background: var(--color-dark-level-2);
        outline: 1px solid var(--border-color-1);

        &:hover {
          background: var(--color-dark-level-2-hover);
          outline: 1px solid var(--border-color-1-hover);
        }
      }
    }
  }
</style>
