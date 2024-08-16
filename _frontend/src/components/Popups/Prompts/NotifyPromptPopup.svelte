<script lang="ts">
  import PromptFramework from "./_PromptFramework.svelte"

  export let text: string
  export let onresult: (result: boolean) => void
</script>

<PromptFramework oncancel={() => onresult(false)} onok={() => onresult(true)}>
  <p>{text}</p>
</PromptFramework>
