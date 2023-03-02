<script lang="ts">
    import { mdiSend } from "@mdi/js";
    import { cluster, group } from "../../lib/stores";
    import Popup from "../../reusables/Popup.svelte";
    import SidebarButton from "../SidebarButton.svelte";

    export let visible: boolean

    let title = ""
    let source = ""
    let content = ""

    const submitStory = async () => {

        const response = await fetch(`/api/cluster/${$cluster.id}/stories`, {
            method: "POST",
            body: JSON.stringify({
                title, source, content
            })
        })

        if (!response.ok)
            throw window.alert("Failed to add story")

        const { id } = await response.json()

        window.location.href = `/?c=${$cluster.id}&g=${id}`

    }
</script>

<Popup title="Create Story" bind:visible>
    
    <main>
        <label>
            Title
            <input type="text" bind:value={title}>
        </label>
        <label>
            Source
            <input type="text" bind:value={source}>
        </label>
        <label for="contentTextarea">
            Content
        </label>
        <textarea bind:value={content} id="contentTextarea" cols="50" rows="20"></textarea>

        <div style="display: flex; justify-content: right">
            <SidebarButton card on:click={submitStory} icon={mdiSend}>Create</SidebarButton>
        </div>
    </main>

</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.5em;
        
        label {
            display: grid;
            grid-template-columns: 100px 1fr;
        }
    }
</style>