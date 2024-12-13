<script lang="ts">
  import { onMount } from "svelte"

  import { page } from "$app/stores"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { type TagExtended } from "$lib/controllers/TagsController.svelte"
  import { uploadPopupOpen } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"
  import Shortcut from "$reusables/Shortcut.svelte"

  import Button from "./Button.svelte"
  import Icon from "./Icon.svelte"
  import Key from "./Key.svelte"
  import TagInputField from "./Tags/TagInputField.svelte"

  let tags: TagExtended[] = $state([])
  let tagInputElement: TagInputField | null = $state(null)

  onMount(() => {
    uploadPopupOpen.subscribe(() => {
      if (tags) tags = mediaController.selectedTags
      if (uploadProgress) uploadProgress = 0
      if (uploadPercentage) uploadPercentage = 0
      if (files) files = []
    })
  })

  let uploadStarted = $state(false)
  let uploadProgress = $state(0)
  let uploadPercentage = $state(0)
  let files: File[] = $state([])

  const onEnter = (e: DragEvent) => {
    e.preventDefault()
    if (!isFileTransfer(e)) return
    $uploadPopupOpen = true
  }

  const onLeave = (e: DragEvent) => {
    e.preventDefault()
    if (e.pageY != 0 && e.pageX != 0) return
    $uploadPopupOpen = false
  }

  const isFileTransfer = (e: DragEvent) =>
    e.dataTransfer?.types.includes("Files")

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
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
      data.append("selectedTags", JSON.stringify(tags.map(t => t.id)))

      await new Promise(resolve => {
        let ajax = new XMLHttpRequest()
        ajax.addEventListener(
          "progress",
          e => {
            uploadPercentage = Math.round((e.loaded / e.total) * 100)
            console.log({
              uploadPercentage,
              loaded: e.loaded,
              total: e.total
            })
          },
          false
        )
        ajax.addEventListener("load", resolve, false)
        ajax.addEventListener("error", () => console.log("Error"), false)
        ajax.addEventListener("abort", () => console.log("Aborted"), false)
        ajax.open(
          "POST",
          `${$page.data.serverURL}/api/cluster/${$page.params.cluster}/media`
        )
        ajax.send(data)
      })

      uploadProgress++
      console.log({ uploadProgress })
    }

    $uploadPopupOpen = false
    uploadStarted = false
    mediaController.updateMedia()
    // TODO: invalidate Tags
  }
</script>

<svelte:document ondragenter={onEnter} ondragleave={onLeave} />

{#if $uploadPopupOpen}
  <Shortcut shift key="T" action={() => tagInputElement?.focus()} />

  <Popup title="Upload Files" on:close={() => ($uploadPopupOpen = false)}>
    <main>
      {#if !uploadStarted}
        <div
          class="dropZone"
          ondrop={handleDrop}
          ondragover={e => e.preventDefault()}
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
            onselected={tag => (tags = tags.concat(tag))}
          />
          <div>
            <Key key="shift" />
            <Key key="T" />
          </div>
        </div>
        <div class="tagsList">
          {#each tags as tag}
            <span
              class="tag"
              oncontextmenu={e => {
                e.preventDefault()
                tags = tags.filter(t => t != tag)
              }}
            >
              {tag.tag}
            </span>
          {/each}
          {#if tags.length == 0}
            <span>No Tag</span>
          {/if}
        </div>
      </div>

      <div class="files-wrapper">
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
      </div>
    </main>

    <svelte:fragment slot="actionsLeft">
      <Button card onclick={() => ($uploadPopupOpen = false)}>Cancel</Button>
    </svelte:fragment>

    <svelte:fragment slot="actionsRight">
      <Button
        card
        highlighted
        icon="mdiUpload"
        onclick={upload}
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
    gap: 1.5em;
    padding: 0.5em;

    .dropZone {
      cursor: pointer;

      display: flex;
      flex-direction: column;
      gap: 0.25em;
      align-items: center;

      padding: 1em;

      border: 1px dashed var(--border-color-1-hover);
    }

    .tags {
      display: grid;
      gap: 0.5em;

      b {
        font-size: 1.1em;
        font-weight: 500;
      }

      .tagsHeader {
        display: flex;
        justify-content: space-between;

        div {
          display: flex;
          align-items: center;
        }
      }
    }

    .files-wrapper {
      overflow-y: scroll;
      max-height: 50vh;

      .files {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.25em;
        align-items: end;

        b:first-child {
          font-size: 1.1em;
          font-weight: 500;
        }

        span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .tagsList {
      display: flex;

      .tag {
        cursor: pointer;

        margin: 0.15em;
        margin-right: 0.25em;
        padding: 0.3em 0.5em;

        background: var(--color-dark-level-2);
        border: 1px solid var(--color-dark-level-1);
        border-radius: 3px;
      }
    }
  }

  #hidden-input {
    display: none;
  }
</style>
