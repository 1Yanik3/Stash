<script lang="ts">
    import Button from "$components/elements/Button.svelte"
    import Dropdown from "$reusables/Dropdown.svelte"

    interface Props {
        options: string[]
        value: string
        onresult: (value: string | null) => void
    }

    let { options, value, onresult }: Props = $props()
</script>

<svelte:window
    onmouseup={e => {
        // @ts-ignore
        if (!document.querySelector("#dropdownContainer")?.contains(e.target))
            onresult(null)
    }}
/>

<Dropdown top={50} right={8} position="absolute">
    {#each options as option}
        <Button active={option == value} onclick={() => onresult(option)}>
            {option.substring(0, 1).toUpperCase() + option.substring(1)}
        </Button>
    {/each}
</Dropdown>
