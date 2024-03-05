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

  let inputElement: HTMLInputElement
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
    <input
      bind:this={inputElement}
      type="text"
      bind:value
      on:keydown={onInput}
    />
  </label>
</PromptFramework>
