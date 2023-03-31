<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte"
    import Popup from "../../../reusables/Popup.svelte"
    import SidebarButton from "../../SidebarButton.svelte"

    export let visible: boolean = true
    export let text: string
    export let value = ""

    const dispatch = createEventDispatcher();

    const onInput = (e: KeyboardEvent) => {
        if (e.key == "Enter") {
            dispatch("result", true)
        }
    }

    let inputElement: HTMLInputElement
    onMount(() => {
        inputElement.focus()
    })
</script>

<Popup bind:visible>
    <main>
        <label>
            <span>{text}:</span>
            <input bind:this={inputElement} type="text" bind:value on:keydown={onInput}>
        </label>
        <div>
            <SidebarButton card icon={null}
                on:click={() => {dispatch("result", false); visible = false}}
            >
                Cancel
            </SidebarButton>
            <SidebarButton card icon={null} highlighted
                on:click={() => dispatch("result", true)}
            >
                Ok
            </SidebarButton>
        </div>
    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        gap: 0.5em;

        label {
            display: grid;
            gap: 0.5em;
        }

        div {
            display: flex;
            justify-content: right;
        }
    }
</style>