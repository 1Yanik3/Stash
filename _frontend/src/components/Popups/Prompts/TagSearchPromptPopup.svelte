<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import PromptFramework from "./_PromptFramework.svelte"
  import TagInputField from "../../Tags/TagInputField.svelte"

  export let question: string
  export let value: string

  const dispatch = createEventDispatcher()

  let inputElement: HTMLInputElement
</script>

<PromptFramework
  on:cancel={() => dispatch("result", null)}
  on:ok={() => dispatch("result", value)}
>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label>
    <span>{question}:</span>

    <TagInputField
      on:selected={({ detail }) => dispatch("result", detail.toLowerCase())}
    />
  </label>
</PromptFramework>
