<script lang="ts">
    import PromptFramework from "./_PromptFramework.svelte"

    interface Props {
        text: string
        onresult: (result: boolean) => void
    }

    let { text, onresult }: Props = $props()
</script>

<PromptFramework oncancel={() => onresult(false)} onok={() => onresult(true)}>
    <pre>
    <code>{text}</code>
  </pre>
</PromptFramework>

<style>
    pre {
        overflow-y: auto;
    }
</style>
