<script lang="ts">
    import type { possibleIcons } from "$lib/possibleIcons";
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import Icon from "../../../Icon.svelte";
    import SidebarButton from "../../../../routes/[cluster]/SidebarButton.svelte";

    let data: { tag: string; icon: keyof typeof possibleIcons }[] = [];
    const updateData = async () => {
        data = await (await fetch("/api/global/tag-icons")).json();
    };
    onMount(updateData);

    let newTag = "";
    let newIcon: keyof typeof possibleIcons | null = null;

    const addNewTag = async () => {
        const { ok } = await fetch("/api/global/tag-icons", {
            method: "POST",
            body: JSON.stringify({
                tag: newTag,
                icon: newIcon,
            }),
        });

        if (ok) {
            newTag = "";
            newIcon = null;
            updateData();
        }
    };

    const deleteTag = async (tag: string) => {
        const { ok } = await fetch("/api/global/tag-icons", {
            method: "DELETE",
            body: JSON.stringify({
                tag: newTag,
            }),
        });

        if (ok) {
            newTag = "";
            newIcon = null;
            updateData();
        }
    };
</script>

<main in:fade>
    <input bind:value={newTag} />
    <Icon name={newIcon} />
    <input bind:value={newIcon} />
    <SidebarButton icon="mdiPlus" on:click={addNewTag} />

    <div class="divider" />

    {#each data as { tag, icon }}
        {tag}
        <Icon name={icon} />
        <input bind:value={icon} />
        <SidebarButton icon="mdiTrashCan" on:click={() => deleteTag(tag)} />
    {/each}
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 0.25em 0.5em;
        align-items: center;

        .divider {
            grid-column: span 4;
            border-top: 1px solid hsl(0, 0%, 22%);
        }
    }
</style>
