<script lang="ts">
    import PromptFramework from "./_PromptFramework.svelte"

    interface Props {
        question: string
        options: string[]
        value: string
        onresult: (value: string | null) => void
    }

    let { question, options, value = $bindable(), onresult }: Props = $props()
</script>

<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(value)}>
    <label>
        <span>{question}:</span>
        <select bind:value>
            {#each options as option}
                <option value={option}>{option}</option>
            {/each}
        </select>
    </label>
</PromptFramework>
