<script lang="ts">
  import PromptFramework from "./_PromptFramework.svelte"

  export let question: string
  export let options: string[]
  export let value: string
  export let onresult: (value: string | null) => void
</script>

<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(value)}>
  <label>
    <span>{question}:</span>
    <select bind:value>
      {#each options as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </label>
</PromptFramework>
