<script lang="ts">
    import Popup from "../../reusables/Popup.svelte";
    import SidebarButton from "../SidebarButton.svelte";
    import { group } from "../../lib/stores";
    
    export let visible: boolean
    let loading = false

    const importElement = async (filename: string) => {
        loading = true

        const response = await fetch(`/api/group/${$group.id}/import`, {
            method: "POST",
            body: JSON.stringify({
                filename
            })
        })

        if (response.ok)
            loading = false
        else
            throw "Something went wrong with the import"
    }
</script>


<Popup title="Import" bind:visible>
    <main>
        {#if loading}
            <!-- TODO: Loading spinner -->
            <b>Loading...</b>
        {:else}
            {#await fetch(`/api/group/-1/import`).then(res => res.json()) then availableImports}
                {#each availableImports as availableImport}
                    <SidebarButton card on:click={() => importElement(availableImport)} icon={null}>{availableImport}</SidebarButton>
                    
                {/each}
            {/await}
        {/if}
    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.5em;
    }
</style>