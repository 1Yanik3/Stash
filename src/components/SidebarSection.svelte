<script lang="ts">
    export let title: string | null = null;
    
    export let justify: boolean = false;
</script>

<div style={justify ? "display: flex; justify-content: space-between; margin: 0.5em" : ""}>
    {#if title}
        <span>{title}</span>
    {/if}
    <slot/>
</div>

<style>
    span {
        display: block;
        margin: 0.5em 0.75em;
        filter: opacity(0.6);
        font-weight: 200;
    }
</style>