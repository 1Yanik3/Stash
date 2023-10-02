<script lang="ts">
    import { page } from "$app/stores";
    import { selectedTags } from "$lib/stores";
    import type { possibleIcons } from "$lib/possibleIcons";
    import type { PageData } from "./$types";
    import SidebarButton from "./SidebarButton.svelte";
    
    type TagData = {
        name: string;
        count: number;
        children: TagData;
    }[];

    export let name: string;
    export let count: number;
    export let children: TagData;
    export let indent = 0;

    let element: HTMLAnchorElement;
    // if (element && $selectedTags.length == 1 && $selectedTags.includes(name.toLowerCase())) {
    //     console.log("scroll!")
    // }

    selectedTags.subscribe(tags => {
        if (tags.length == 1 && tags.includes(name.toLowerCase())) {
            setTimeout(() => {
                console.log("scrolla!")
                element?.scrollIntoView({ block: "nearest" })
            }, 100);
        }
    })

    $: icon = ($page.data as PageData).tagIcons.find((t) => t.tag == name .toLowerCase()|| name.toLowerCase().substring(name.toLowerCase().lastIndexOf("/") + 1) == t.tag)?.icon as keyof typeof possibleIcons;
</script>

<SidebarButton
    {indent}
    {count}
    icon={icon ? icon : "mdiFolderOutline"}
    on:click={(e) => {
        // @ts-ignore
        if (e.detail.altKey) {
            if ($selectedTags.includes(name.toLowerCase()))
                selectedTags.set($selectedTags.filter((t) => t != name.toLowerCase()));
            else selectedTags.set([...$selectedTags, name.toLowerCase()]);
        } else {
            selectedTags.set([name.toLowerCase()]);
        }
    }}
    active={$selectedTags.includes(name.toLowerCase())}
    bind:element
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
