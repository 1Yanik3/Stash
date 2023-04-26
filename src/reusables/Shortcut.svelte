<script lang="ts">
    export let alt = false
    export let opt = false
    export let meta = false
    export let control = false
    export let shift = false

    export let key: string

    export let action: Function

    let handler = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement) {
            return
        }

        if (
            (alt || opt)
            ? !e.altKey
            : e.altKey
        ) return

        if (
            shift
            ? !e.shiftKey
            : e.shiftKey
        ) return

        if (
            (control || meta)
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