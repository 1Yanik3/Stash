<script lang="ts">
    export let alt = false
    export let opt = false
    export let meta = false
    export let control = false
    export let shift = false
    export let modifier: "alt" | "opt" | "meta"| "control" | "shift" | null = null

    export let key: string

    export let action: Function

    let handler = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return
        }

        if (
            (alt || opt || modifier == "alt" || modifier == "opt")
            ? !e.altKey
            : e.altKey
        ) return

        if (
            (shift || modifier == "shift")
            ? !e.shiftKey
            : e.shiftKey
        ) return

        if (
            (control || meta || modifier == "control" || modifier == "meta")
            ? !(e.metaKey || e.ctrlKey)
            : e.metaKey
        ) return

        if (key != e.key)
            return

        e.preventDefault()
        action()
    }

</script>

<svelte:window on:keydown={handler}/>
