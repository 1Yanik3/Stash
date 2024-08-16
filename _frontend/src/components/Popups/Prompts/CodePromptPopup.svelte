<script lang="ts">

  import PromptFramework from "./_PromptFramework.svelte"

  export let text: string
  export let onresult: (result: boolean) => void
</script>

<PromptFramework
  oncancel={() => onresult(false)}
  onok={() => onresult(true)}
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
