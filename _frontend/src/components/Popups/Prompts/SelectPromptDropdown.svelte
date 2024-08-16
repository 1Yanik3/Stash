<script lang="ts">
  import Button from "$components/Button.svelte"
  import Dropdown from "$reusables/Dropdown.svelte"

  export let options: string[]
  export let value: string
  export let onresult: (value: string | null) => void
</script>

<svelte:window
  on:mouseup={e => {
    // @ts-ignore
    if (!document.querySelector("#dropdownContainer")?.contains(e.target))
      onresult(null)
  }}
/>

<Dropdown top={50} right={8} position="absolute">
  {#each options as option}
    <Button active={option == value} on:click={() => onresult(option)}>
      {option.substring(0, 1).toUpperCase() + option.substring(1)}
    </Button>
  {/each}
</Dropdown>
