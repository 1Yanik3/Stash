<script lang="ts">
    export let onDrop: any
    export let onEnter: Function | null = null
    export let onLeave: Function | null = null
    export let accept: "files" = "files"

    let input: any

    const isFileTransfer = (e: DragEvent) => e.dataTransfer?.types.includes("Files")

    const handleEnter = (e: DragEvent) => {
        if (!onEnter) return

        // console.log(e.dataTransfer?.types, isFileTransfer(e));

        if (accept == "files" && isFileTransfer(e))
            onEnter()

    }

    const handleLeave = () => {
        if (onLeave) { onLeave() }
    }

    const handleDrop = (e: DragEvent) => {
        
        if (accept == "files") {

            if (!isFileTransfer(e)) {
                return
            }

            const items = Array.from(e.dataTransfer?.items || [])
            onDrop(items.map((d: any) => d.getAsFile()))

        }

    }

    const handleChange = (e: any) => {
        e.preventDefault()
        onDrop(Array.from(e.target.files))
    }
</script>
  
<div
    id="zone"
    on:drop|preventDefault|stopPropagation={handleDrop}
    on:dragover|preventDefault={() => {}}
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