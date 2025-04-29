<script lang="ts">
    import PromptFramework from "./_PromptFramework.svelte"

    interface Props {
        text: string
        onresult: (result: boolean) => void
    }

    let { text, onresult }: Props = $props()
</script>

<PromptFramework oncancel={() => onresult(false)} onok={() => onresult(true)}>
    <p>{text}</p>
</PromptFramework>
