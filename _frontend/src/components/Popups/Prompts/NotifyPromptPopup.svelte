<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import PromptFramework from "./_PromptFramework.svelte"

  export let text: string

  const dispatch = createEventDispatcher()
</script>

<PromptFramework
  on:cancel={() => dispatch("result", false)}
  on:ok={() => dispatch("result", true)}
>
  <p>{text}</p>
</PromptFramework>
