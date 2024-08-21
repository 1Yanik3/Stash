<script lang="ts">
  import { onMount } from "svelte"

  import PromptFramework from "./_PromptFramework.svelte"

  export let question: string
  export let value: string
  let _value = value

  export let onresult: (value: string | null) => void

  const onInput = (e: KeyboardEvent) => {
    if (e.key == "Enter") {
      onresult(_value)
    }
  }

  let inputElement: HTMLTextAreaElement
  onMount(() => {
    inputElement.focus()
  })
</script>

<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(_value)}>
  <label>
    <span>{question}:</span>
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <textarea
      name="text"
      rows="3"
      wrap="soft"
      bind:this={inputElement}
      bind:value={_value}
      onkeydown={onInput}
    />
  </label>
</PromptFramework>

<style lang="scss">
  label {
    display: grid;
    gap: 0.5em;
    min-width: 300px;
  }
</style>
