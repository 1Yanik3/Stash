<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "../../components/Icon.svelte";
    import { page } from "$app/stores";
    import type { possibleIcons } from "$lib/possibleIcons";

    import type { PageData } from "./$types";
    $: pageData = $page.data as PageData;

    let isDraggingOver = false;

    // @ts-ignore
    export let element: HTMLAnchorElement = null;

    export let icon: keyof typeof possibleIcons | null = null;
    export let indent: number = 0;
    export let count: number | null = null;
    export let active: boolean = false;

    export let hidden = false;
    export let right = false;
    export let card = false;
    export let highlighted = false;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    //#region Handle Drag (for moving media)

    const isFileTransfer = (e: DragEvent) =>
        e.dataTransfer?.types.includes("Files");

    // TODO
    // const handleDrop = (e: DragEvent) => {
    //     const items = e.dataTransfer?.items
    //     if (!items) return

    //     for (const i in items) {
    //         const item = items[i]
    //         if (item.type == "text/plain") item.getAsString(async mediaId => {

    //             if (mediaId.startsWith("mediaId_")) {

    //                 mediaId = mediaId.replace("mediaId_", "")

    //                 const response = await fetch(`/api/media/${mediaId}/group`, {
    //                     method: 'PUT',
    //                     body: JSON.stringify({
    //                         groupId: target?.id
    //                     })
    //                 })

    //                 // TODO ?
    //                 if (response.ok)
    //                     invalidateAll()
    //                 else
    //                     window.alert("Something wen't wrong moving media")

    //             }

    //         })
    //     }

    //     isDraggingOver = false
    // }
    // const handleEnter = (e: DragEvent) => {
    //     if (isFileTransfer(e)) return

    //     isDraggingOver = true
    // }
    // const handleLeave = (e: DragEvent) => {
    //     isDraggingOver = false
    // }

    //#endregion
</script>

<!-- TODO: Maybe we can get rid of the href? -->
<a
    bind:this={element}
    href={null}
    style={`padding-left: ${0.75 + indent}em`}
    class:active
    class:hidden
    class:right
    class:highlighted
    on:click={(e) => {
        dispatch("click", e);
        // TODO
        // if (tag) {
        //     // is a tag button

        //     if (tag.name == "Untagged")
        //         pageData.tags.filter(t => t.name != "Untagged").forEach(t => t.active = false)
        //     else
        //         // @ts-ignore
        //         pageData.tags.find(t => t.name == "Untagged").active = false

        //     const tmp = pageData.tags.find(t => t == tag)
        //     if (tmp)
        //         tmp.active = !tag.active

        // }
    }}
    on:dblclick={async () => {
        // TODO
        // if (!target || !target.collapsed) return
        // const req = await fetch(`/api/group/${target.id}/collapsed`, {
        //     method: "PATCH"
        // })
        // const res = !!(await req.json())
        // target.collapsed = res
        // on:drop|preventDefault|stopPropagation={handleDrop}
        // on:dragover|preventDefault={() => {}}
        // on:dragenter={handleEnter}
        // on:dragleave={handleLeave}
    }}
    class:isDraggingOver
    class:card
    class:disabled
>
    <div class="section">
        {#if icon != null}
            <!-- @ts-ignore -->
            <div class="spacer">
                <Icon name={icon || "mdiHelp"} size={"1.25em"} />
            </div>
        {/if}
        <span>
            <slot />
        </span>
    </div>

    {#if count}
        <div class="section" style="filter: opacity(0.6)">
            <span>{count}</span>
        </div>
    {/if}
</a>

<style lang="scss">
    a {
        font-weight: 200;
        text-decoration: none;

        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 0.5em 0.75em;
        margin: 0.15em 0.5em;
        border-radius: 0.35em;

        transition: background 100ms, border 100ms;
        border: 1px solid transparent;

        &.card {
            background: hsl(0, 0%, 13%);
            border: 1px solid hsl(0, 0%, 24%);
            margin: 0.25em;
        }

        &.disabled {
            opacity: 75%;
            pointer-events: none;
        }

        &:hover {
            background: hsl(0, 0%, 22%);
            border: 1px solid hsl(0, 0%, 24%);
        }
        &.active {
            background: hsl(0, 0%, 24%);
            border: 1px solid hsl(0, 0%, 33%);
        }
        &.highlighted {
            background: hsl(0, 0%, 33%);
            border: 1px solid hsl(0, 0%, 35%);
            &:hover {
                background: hsl(0, 0%, 42%);
                border: 1px solid hsl(0, 0%, 44%);
            }
        }

        &.isDraggingOver {
            background: hsl(0, 0%, 30%);
            border: 1px solid hsl(0, 0%, 45%);
        }
        .section {
            display: grid;
            grid-auto-flow: column;
            align-items: center;

            .spacer {
                margin-right: 0.35em;
            }
            span {
                font-weight: 200;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        &.hidden {
            justify-content: center;
            align-items: center;
            .section {
                .spacer {
                    margin-right: unset;
                }
            }
            span {
                display: none;
            }
        }

        &.right {
            &,
            .section {
                flex-direction: row-reverse;
            }
        }
    }
</style>
