<script lang="ts">
  import { controller } from "$lib/stores"
  import { onDestroy, onMount } from "svelte"

  let value = -1
  let interval: NodeJS.Timeout | null = null

  $: {
    if (interval) clearInterval(interval)
    interval = setInterval(() => {
      if (value == -1) return
      $controller.goToNextMedia()
    }, value * 1000)
  }

  onDestroy(() => interval && clearInterval(interval))
</script>

<main>
  <select bind:value>
    <option value={-1}>Paused</option>
    {#each [1, 3, 5, 7, 10, 15] as seconds}
      <option value={seconds}
        >{seconds} {seconds == 1 ? "second" : "seconds"}</option
      >
    {/each}
  </select>
</main>

<style lang="scss">
  main {
    position: fixed;
    z-index: 99;
    right: 1em;
    bottom: 1em;

    background: var(--color-dark-level-base);
    border: 1px solid var(--border-color-1);
    border-radius: 0.5em;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 3px 9px 0px,
      rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
  }
</style>
