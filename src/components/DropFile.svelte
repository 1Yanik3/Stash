<script lang="ts">
  import { invalidate } from "$app/navigation"
  import { page } from "$app/stores"
  import { selectedTags, uploadPopupOpen } from "$lib/stores"
  import { onMount } from "svelte"
  import Popup from "$reusables/Popup.svelte"
  import Button from "./Button.svelte"
  import Icon from "./Icon.svelte"
  import TagInputField from "./Tags/TagInputField.svelte"
  import Key from "./Key.svelte"
  import Shortcut from "$reusables/Shortcut.svelte"

  let tags: String[] = []
  let tagInputElement: TagInputField

  onMount(() => {
    selectedTags.subscribe(() => (tags = $selectedTags))
    uploadPopupOpen.subscribe(() => {
      if (tags) tags = $selectedTags
      if (uploadProgress) uploadProgress = 0
      if (uploadPercentage) uploadPercentage = 0
      if (files) files = []
    })
  })

  let uploadStarted = false
  let uploadProgress = 0
  let uploadPercentage = 0
  let files: File[] = []

  const onEnter = (e: DragEvent) => {
    if (!isFileTransfer(e)) return
    $uploadPopupOpen = true
  }

  const onLeave = (e: DragEvent) => {
    if (e.pageY != 0 && e.pageX != 0) return
    $uploadPopupOpen = false
  }

  const isFileTransfer = (e: DragEvent) =>
    e.dataTransfer?.types.includes("Files")

  const handleDrop = (e: DragEvent) => {
    if (!isFileTransfer(e)) return

    const items = Array.from(e.dataTransfer?.items || [])
    files = files.concat(items.map((d: any) => d.getAsFile()))
  }

  const upload = async () => {
    uploadStarted = true

    for (const i in files) {
      uploadPercentage = 0

      const data = new FormData()
      data.append("file", files[i])
      data.append("selectedTags", tags.join(","))

      await new Promise(resolve => {
        var ajax = new XMLHttpRequest()
        ajax.upload.addEventListener(
          "progress",
          e => {
            uploadPercentage = Math.round((e.loaded / e.total) * 100)
            console.log({ uploadPercentage, loaded: e.loaded, total: e.total })
          },
          false
        )
        ajax.addEventListener("load", resolve, false)
        ajax.addEventListener("error", () => console.log("Error"), false)
        ajax.addEventListener("abort", () => console.log("Aborted"), false)
        ajax.open("POST", `/api/cluster/${$page.params.cluster}/media`)
        ajax.send(data)
      })

      uploadProgress++
      console.log({ uploadProgress })
    }

    $uploadPopupOpen = false
    uploadStarted = false
    invalidate("media-and-tags")
  }
</script>

<svelte:document
  on:dragenter|preventDefault={onEnter}
  on:dragleave|preventDefault={onLeave}
/>

{#if $uploadPopupOpen}
  <Shortcut shift key="T" action={() => tagInputElement.focus()} />

  <Popup title="Upload Files" on:close={() => ($uploadPopupOpen = false)}>
    <main>
      {#if !uploadStarted}
        <div
          class="dropZone"
          on:drop|preventDefault={handleDrop}
          on:dragover|preventDefault={() => {}}
        >
          <Icon name="mdiFileUpload" size={2.5} />
          <span>Drop or click to upload</span>
        </div>
      {/if}

      <div class="tags">
        <b>Tags</b>
        <div class="tagsHeader">
          <TagInputField
            bind:this={tagInputElement}
            alwaysExpanded
            on:selected={({ detail }) => (tags = tags.concat([detail]))}
          />
          <div>
            <Key key="shift" />
            <Key key="T" />
          </div>
        </div>
        <div class="tagsList">
          {#each tags as tag}
            <span
              on:contextmenu|preventDefault={() =>
                (tags = tags.filter(t => t != tag))}>{tag}</span
            >
          {/each}
          {#if tags.length == 0}
            <span>No Tag</span>
          {/if}
        </div>
      </div>

      <div class="files">
        <b>Files</b>
        <b>Status</b>
        {#each files as f, i}
          <span>{f.name}</span>
          <span>
            {#if uploadStarted}
              {#if uploadProgress == i}
                {uploadPercentage}
              {/if}
              {#if uploadProgress > i}
                Done
              {/if}
            {/if}
          </span>
        {/each}
      </div>
    </main>

    <svelte:fragment slot="actionsLeft">
      <Button card on:click={() => ($uploadPopupOpen = false)}>Cancel</Button>
    </svelte:fragment>

    <svelte:fragment slot="actionsRight">
      <Button
        card
        highlighted
        icon="mdiUpload"
        on:click={upload}
        shortcut={{ modifier: "meta", key: "enter" }}
      />
    </svelte:fragment>
  </Popup>
{/if}

<slot />

<input id="hidden-input" type="file" bind:value={files} multiple />

<style lang="scss">
  main {
    display: grid;
    padding: 0.5em;
    gap: 1.5em;

    .dropZone {
      padding: 1em;

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25em;

      border: 1px dashed hsl(0, 0%, 24%);
      cursor: pointer;
    }

    .tags {
      display: grid;
      gap: 0.5em;

      b {
        font-weight: 500;
        font-size: 1.1em;
      }

      .tagsHeader {
        display: flex;
        justify-content: space-between;

        div {
          display: flex;
          align-items: center;
        }
      }

      .tagsList {
        display: flex;

        span {
          background: $color-dark-level-2;
          padding: 0.3em 0.5em;
          margin: 0.15em;
          border: 1px solid $color-dark-level-1;
          border-radius: 3px;

          margin-right: 0.25em;

          cursor: pointer;
        }
      }
    }

    .files {
      display: grid;
      align-items: end;
      grid-template-columns: 1fr auto;
      gap: 0.25em;

      b:first-child {
        font-weight: 500;
        font-size: 1.1em;
      }

      span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  #hidden-input {
    display: none;
  }
</style>
