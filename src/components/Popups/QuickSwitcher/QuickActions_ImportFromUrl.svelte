<script lang="ts">
  import { page } from "$app/stores"
  import { controller, selectedTags } from "$lib/stores"
  import Popup from "../../../reusables/Popup.svelte"
  import SidebarButton from "../../../routes/[cluster]/SidebarButton.svelte"
  import type { Metadata } from "../../../routes/api/yt-dlp/scan/+server"

  let url = ""
  let metadata: Metadata | null = null

  const searchUrl = async () => {
    console.log("search")
    // TODO: Add loading screen
    const response = await fetch(`/api/yt-dlp/scan`, {
      method: "POST",
      body: JSON.stringify({ url })
    })
    metadata = await response.json()
  }

  const download = async () => {
    if (!metadata) return
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
        tags: $selectedTags // TODO add tag selector
      })
    })
    // TODO: Progress bar
    if (response.ok)
        $controller.setPopup(null)
  }
</script>

<Popup title="Import from URL">
  <main>
    <div class="inputField">
      <input type="url" placeholder="https://..." bind:value={url} />
      <SidebarButton icon="mdiSearchWeb" on:click={searchUrl} />
    </div>

    {#if metadata}
      <div class="metadata">
        <img src={metadata.thumbnail} alt="" />
        <span>Title: <span>{metadata.title}</span></span>
        <span>Format: <span>{metadata.format}</span></span>
        {#if metadata.duration_string}
          <span>Duration: <span>{metadata.duration_string}</span></span>
        {/if}
      </div>

      <!-- TODO: Add tag selector like in the upload popup -->
    {/if}
  </main>

  <svlete:fragment slot="actionsRight">
    <SidebarButton
      card
      icon="mdiDownload"
      disabled={!metadata}
      on:click={download}
    >
      Download
    </SidebarButton>
  </svlete:fragment>
</Popup>

<style lang="scss">
  main {
    display: grid;
    gap: 0.5em;

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
      img {
        width: 400px;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: 0.5em;
      }
      & > span {
        margin: 0 1em;
      }
    }
  }
</style>
