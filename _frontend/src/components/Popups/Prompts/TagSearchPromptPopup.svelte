<script lang="ts">
  import type { TagExtended } from "$lib/controllers/TagsController.svelte"

  import TagInputField from "../../Tags/TagInputField.svelte"
  import PromptFramework from "./_PromptFramework.svelte"

  export let question: string
  export let value: string
  export let onresult: (value: TagExtended | null) => void
</script>

<!-- TODO: FIX -->
<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(null)}>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label>
    <span>{question}:</span>

    <TagInputField onselected={onresult} />
  </label>
</PromptFramework>
