<script lang="ts">
    import { mdiAppleKeyboardCommand, mdiAppleKeyboardControl, mdiAppleKeyboardOption, mdiAppleKeyboardShift, mdiArrowDown, mdiArrowLeft, mdiArrowRight, mdiArrowUp, mdiBackspaceOutline, mdiKeyboardCaps, mdiKeyboardEsc, mdiKeyboardF1, mdiKeyboardF10, mdiKeyboardF11, mdiKeyboardF12, mdiKeyboardF2, mdiKeyboardF3, mdiKeyboardF4, mdiKeyboardF5, mdiKeyboardF6, mdiKeyboardF7, mdiKeyboardF8, mdiKeyboardF9, mdiKeyboardReturn, mdiKeyboardSpace, mdiKeyboardTab } from "@mdi/js"
    import Icon from "./Icon.svelte"

    export let key: string

    const iconOverwrites: any = {
        "escape": mdiKeyboardEsc,
        "F1": mdiKeyboardF1,
        "F2": mdiKeyboardF2,
        "F3": mdiKeyboardF3,
        "F4": mdiKeyboardF4,
        "F5": mdiKeyboardF5,
        "F6": mdiKeyboardF6,
        "F7": mdiKeyboardF7,
        "F8": mdiKeyboardF8,
        "F9": mdiKeyboardF9,
        "F10": mdiKeyboardF10,
        "F11": mdiKeyboardF11,
        "F12": mdiKeyboardF12,
        "backspace": mdiBackspaceOutline,
        "tab": mdiKeyboardTab,
        "caps": mdiKeyboardCaps,
        "enter": mdiKeyboardReturn,
        "shift": mdiAppleKeyboardShift,
        "shiftR": mdiAppleKeyboardShift,
        "control": mdiAppleKeyboardControl,
        "option": mdiAppleKeyboardOption,
        "command": mdiAppleKeyboardCommand,
        "space": mdiKeyboardSpace,
        "arrowLeft": mdiArrowLeft,
        "arrowUp": mdiArrowUp,
        "arrowDown": mdiArrowDown,
        "arrowRight": mdiArrowRight
    }

</script>

<main>
    {#if iconOverwrites[key]}
        <Icon name="iconOverwrites[key]" size={0.7} title={key.substring(0, 1).toUpperCase() + key.substring(1)}/>
    {:else}
        <span>{key}</span>
    {/if}
</main>

<style lang="scss">
    main {
        height: 1.75em;
        width: 1.75em;
        margin-left: 0.25em;
        
        background: hsl(0, 0%, 7%);
        border-radius: 5px;
        border: 1px solid hsl(0, 0%, 17%);
        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>