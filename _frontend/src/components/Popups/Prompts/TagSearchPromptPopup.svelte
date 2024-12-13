<script lang="ts">
  import type { TagExtended } from "$lib/controllers/TagsController.svelte"

  import TagInputField from "../../Tags/TagInputField.svelte"
  import PromptFramework from "./_PromptFramework.svelte"

  interface Props {
    question: string;
    value: string;
    onresult: (value: TagExtended | null) => void;
  }

  let { question, value, onresult }: Props = $props();
</script>

<!-- TODO: FIX -->
<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(null)}>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label>
    <span>{question}:</span>

    <TagInputField onselected={onresult} />
  </label>
</PromptFramework>
