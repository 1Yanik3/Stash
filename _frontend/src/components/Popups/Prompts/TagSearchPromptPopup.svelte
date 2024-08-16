<script lang="ts">
  import TagInputField from "../../Tags/TagInputField.svelte"
  import PromptFramework from "./_PromptFramework.svelte"

  export let question: string
  export let value: string
  export let onresult: (value: string | null) => void
</script>

<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(value)}>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label>
    <span>{question}:</span>

    <TagInputField
      on:selected={({ detail }) => onresult(detail.toLowerCase())}
    />
  </label>
</PromptFramework>
