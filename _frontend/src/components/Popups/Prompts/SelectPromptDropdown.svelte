<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Dropdown from "$reusables/Dropdown.svelte"
  import Button from "$components/Button.svelte"

  export let options: string[]
  export let value: string

  const dispatch = createEventDispatcher()
</script>

<svelte:window
  on:mouseup={e => {
    // @ts-ignore
    if (!document.querySelector("#dropdownContainer")?.contains(e.target))
      dispatch("result", null)
  }}
/>

<Dropdown top={50} right={8} position="absolute">
  {#each options as option}
    <Button
      active={option == value}
      on:click={() => dispatch("result", option)}
    >
      {option.substring(0, 1).toUpperCase() + option.substring(1)}
    </Button>
  {/each}
</Dropdown>
