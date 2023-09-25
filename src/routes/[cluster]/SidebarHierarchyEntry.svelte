<script lang="ts">
    import { page } from "$app/stores";
    import { selectedTags } from "$lib/stores";
    import type { possibleIcons } from "$lib/possibleIcons";
    import type { PageData } from "./$types";
    import SidebarButton from "./SidebarButton.svelte";
    
    // import * as possibleIcons from "@mdi/js";

    type TagData = {
        name: string;
        count: number;
        children: TagData;
    }[];

    export let name: string;
    export let count: number;
    export let children: TagData;
    export let indent = 0;

    $: icon = ($page.data as PageData).tagIcons.find((t) => t.tag == name || name.substring(name.lastIndexOf("/") + 1) == t.tag)?.icon as keyof typeof possibleIcons;
</script>

<SidebarButton
    {indent}
    {count}
    icon={icon ? icon : "mdiFolderOutline"}
    on:click={(e) => {
        // @ts-ignore
        if (e.detail.altKey) {
            if ($selectedTags.includes(name))
                selectedTags.set($selectedTags.filter((t) => t != name));
            else selectedTags.set([...$selectedTags, name]);
        } else {
            selectedTags.set([name]);
        }
    }}
    active={$selectedTags.includes(name)}
>
    {name.replace(/.+\//, "")}
</SidebarButton>

{#if children}
    {#each children.sort((a, b) => a.name.localeCompare(b.name)) as c}
        <svelte:self
            indent={indent + 1}
            name={name + "/" + c.name}
            count={c.count}
            children={c.children}
        />
    {/each}
{/if}
