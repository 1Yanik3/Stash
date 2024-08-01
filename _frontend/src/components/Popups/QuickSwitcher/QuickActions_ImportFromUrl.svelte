<script lang="ts">
  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import { controller, selectedTags } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"

  import type { Metadata } from "../../../routes/api/yt-dlp/scan/+server"
  import TagInputField from "../../Tags/TagInputField.svelte"

  let url = ""
  let metadata: Metadata | null = null
  let loading = false

  let tags: String[] = []
  $: tags = $selectedTags

  const searchUrl = async () => {
    console.log("search")
    const response = await fetch(`/api/yt-dlp/scan`, {
      method: "POST",
      body: JSON.stringify({ url })
    })
    metadata = await response.json()
  }

  const download = async () => {
    if (!metadata) return
    loading = true
    const response = await fetch(`/api/yt-dlp/download`, {
      method: "POST",
      body: JSON.stringify({
        url,
        title: metadata.title,
        timestamp: metadata.timestamp,
        thumbnail: metadata.thumbnail,
        resolution: metadata.resolution,
        ext: metadata.ext,
        _type: metadata._type,
        cluster: $page.params.cluster,
        tags
      })
    })
    loading = false
    if (response.ok) $controller.setPopup(null)
  }
</script>

<Popup title="Import from URL">
  <main>
    <section>
      <div class="inputField">
        <input
          type="url"
          placeholder="https://..."
          bind:value={url}
          on:keydown={e => {
            // @ts-ignore
            if (e.key === "Enter") searchUrl()
          }}
        />
        <Button icon="mdiSearchWeb" on:click={searchUrl} />
      </div>
      {#if metadata}
        <img src={metadata.thumbnail} alt="" />
      {/if}
    </section>

    {#if metadata}
      <section>
        <div class="metadata">
          <span>Title: <span>{metadata.title}</span></span>
          <span>Format: <span>{metadata.format}</span></span>
          {#if metadata.duration_string}
            <span>Duration: <span>{metadata.duration_string}</span></span>
          {/if}
        </div>

        <!-- TODO: Add tag selector like in the upload popup -->
        <div class="tags">
          {#each tags as tag}
            <span
              on:contextmenu|preventDefault={() =>
                (tags = tags.filter(t => t != tag))}>{tag}</span
            >
          {/each}
          {#if tags.length == 0}
            <span>No Tag</span>
          {/if}
          <div style="margin-top: 10px; margin-left: 3px">
            <TagInputField
              on:selected={({ detail }) => (tags = tags.concat([detail]))}
            />
          </div>
        </div>
      </section>
    {/if}
  </main>

  <svlete:fragment slot="actionsRight">
    <Button
      card
      icon="mdiDownload"
      disabled={!metadata || loading}
      on:click={download}
      shortcut={{ modifier: "meta", key: "enter" }}
    >
      Download
    </Button>
  </svlete:fragment>
</Popup>

<style lang="scss">
  main {
    display: flex;
    gap: 0.5em;

    section {
      display: flex;
      flex-direction: column;

      img {
        aspect-ratio: 16 / 9;
        width: 400px;
        margin-top: 1em;

        object-fit: cover;
        border-radius: 0.5em;
      }
    }

    .inputField {
      display: flex;
      width: 400px;

      input {
        flex-grow: 1;
        padding: 12px;
      }
    }

    .metadata {
      display: grid;
      gap: 0.5em;

      & > span {
        margin: 0 1em;
      }
    }

    .tags {
      padding: 0.5em;

      span {
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
</style>
