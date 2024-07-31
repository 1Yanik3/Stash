<script lang="ts">
  import Popup from "$reusables/Popup.svelte"
  import Button from "$components/Button.svelte"
  import { page } from "$app/stores"
  import { controller } from "$lib/stores"

  let query = ""

  let results: {
    title: string
    url: string
    thumbnail: string
    duration: string
  }[] = []

  const searchQuery = async () => {
    console.log("search")

    const response = await fetch(`/api/yt-dlp/search`, {
      method: "POST",
      body: JSON.stringify({ query })
    })
    results = await response.json()
  }

  const download = async (metadata: any) => {
    const response = await fetch(`/api/yt-dlp/download`, {
      method: "POST",
      body: JSON.stringify({
        url: metadata.url,
        title: metadata.title,
        timestamp: metadata.timestamp,
        thumbnail: metadata.thumbnail,
        resolution: metadata.resolution,
        ext: metadata.ext,
        _type: metadata._type,
        cluster: $page.params.cluster,
        tags: []
      })
    })
    if (response.ok) $controller.setPopup(null)
  }

  let videoToPreview: string | null = null
</script>

<Popup title="Import from Search">
  <main>
    <div class="inputField">
      <input
        type="search"
        bind:value={query}
        on:keydown={e => {
          // @ts-ignore
          if (e.key === "Enter") searchQuery()
        }}
      />
      <Button icon="mdiSearchWeb" on:click={searchQuery} />
    </div>

    {#if videoToPreview}
      {#await fetch( `/api/yt-dlp/scan`, { method: "POST", body: JSON.stringify( { url: videoToPreview } ) } ).then( res => res.json() ) then metadata}
        <div style="display: flex;justify-content: space-between;">
          <Button
            icon="mdiArrowLeft"
            on:click={() => (videoToPreview = null)}
          />
          <Button card icon="mdiDownload" on:click={() => download(metadata)}>
            Download
          </Button>
        </div>
        <!-- svelte-ignore a11y-media-has-caption -->
        <video src={metadata.url} controls />
      {/await}
    {:else}
      <div class="results">
        {#each results as result}
          <div class="result" on:click={() => (videoToPreview = result.url)}>
            <img src={result.thumbnail} alt="" />
            <span>{result.title}</span>
          </div>
        {/each}
      </div>
    {/if}
  </main>
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

    .results {
      overflow: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1em;

      height: 60vh;

      .result {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        align-items: center;

        transition: transform 0.2s;

        img {
          aspect-ratio: 16/9;
          width: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        &:hover {
          transform: scale(104%);
        }
      }
    }

    video {
      width: 100%;
      max-height: 60vh;
    }
  }
</style>
