<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import PromptFramework from "./_PromptFramework.svelte"

  export let question: string
  export let options: { value: string; name: string }[]
  export let selected: string[]
  $: console.log({ selected })

  const dispatch = createEventDispatcher()
</script>

<PromptFramework
  on:cancel={() => dispatch("result", null)}
  on:ok={() => dispatch("result", selected)}
>
  <span>{question}:</span>

  <section>
    {#each options as { value, name }}
      <label>
        <input type="checkbox" {value} bind:group={selected} />
        {name}
      </label>
    {/each}
  </section>
</PromptFramework>

<style>
  section {
    display: grid;
    gap: 0.5em;
    padding-top: 0.5em;
  }

  label {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  input:checked {
    background-color: #e0e0e0 !important;
  }
</style>
