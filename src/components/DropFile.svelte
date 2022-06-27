<script lang="ts">
    export let onDrop: any
    export let onEnter: Function | null = null
    export let onLeave: Function | null = null

    let isOver = false
    let input: any

    const handleEnter = () => {
        isOver = true
        if (onEnter) { onEnter() }
    }

    const handleLeave = () => {
        isOver = false
        if (onLeave) { onLeave() }
    }

    const handleDrop = (e: any) => {
        e.preventDefault()
        const items = Array.from(e.dataTransfer.items)
        onDrop(items.map((d: any) => d.getAsFile()))
        isOver = false
    }

    const handleDragOver = (e: any) => {
        e.preventDefault()
    }

    const handleChange = (e: any) => {
        e.preventDefault()
        onDrop(Array.from(e.target.files))
    }
</script>
  
<div
    id="zone"
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragenter={handleEnter}
    on:dragleave={handleLeave}
  >
<slot/>
    </div>
<input
    id="hidden-input"
    type="file"
    on:change={handleChange}
    bind:this={input}
    multiple
/>
  
<style>
    #zone {
        width: 100%;
        height: 100%;
    }

    #hidden-input {
        display: none;
    }
</style>