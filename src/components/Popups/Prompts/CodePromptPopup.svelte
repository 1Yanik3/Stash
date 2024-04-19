<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import PromptFramework from "./_PromptFramework.svelte"

  export let text: string

  const dispatch = createEventDispatcher()
</script>

<PromptFramework
  noCancel
  on:cancel={() => dispatch("result", false)}
  on:ok={() => dispatch("result", true)}
>
  <pre>
    <code>{text}</code>
  </pre>
</PromptFramework>

<style>
    pre {
        overflow-y: auto;
    }
</style>
