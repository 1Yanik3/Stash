<script lang="ts">
  import { createEventDispatcher } from "svelte"

  import PromptFramework from "./_PromptFramework.svelte"

  export let question: string
  export let options: string[]
  export let value: string

  const dispatch = createEventDispatcher()
</script>

<PromptFramework
  on:cancel={() => dispatch("result", null)}
  on:ok={() => dispatch("result", value)}
>
  <label>
    <span>{question}:</span>
    <select bind:value>
      {#each options as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </label>
</PromptFramework>
