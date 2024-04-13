<script lang="ts">
    import { mdiSend } from "@mdi/js";
    import Popup from "$reusables/Popup.svelte";
    import Button from "../Button.svelte";
    import { page } from "$app/stores";
    import type { PageData } from "../../routes/[cluster]/$types";
    $: pageData = $page.data as PageData

    let title = ""
    let source = ""
    let content = ""

    const submitStory = async () => {

        const response = await fetch(`/api/cluster/${pageData.cluster.id}/stories`, {
            method: "POST",
            body: JSON.stringify({
                title, source, content
            })
        })

        if (!response.ok)
            throw window.alert("Failed to add story")

        const { id } = await response.json()

        window.location.href = `/?c=${pageData.cluster.id}&g=${id}`

    }
</script>

<Popup title="Create Story">
    
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
            <Button card on:click={submitStory} icon="mdiSend">Create</Button>
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
