<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import PromptFramework from "./_PromptFramework.svelte"

  export let question: string
  export let value: string

  const dispatch = createEventDispatcher()

  const onInput = (e: KeyboardEvent) => {
    if (e.key == "Enter") {
      dispatch("result", value)
    }
  }

  let inputElement: HTMLTextAreaElement
  onMount(() => {
    inputElement.focus()
  })
</script>

<PromptFramework
  on:cancel={() => dispatch("result", null)}
  on:ok={() => dispatch("result", value)}
>
  <label>
    <span>{question}:</span>
    <textarea
      name="text"
      rows="3"
      wrap="soft"
      bind:this={inputElement}
      bind:value
      on:keydown={onInput}
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
