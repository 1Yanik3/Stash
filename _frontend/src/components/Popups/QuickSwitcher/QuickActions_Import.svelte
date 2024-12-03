<script lang="ts">
  import { page } from "$app/stores"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import Popup from "$reusables/Popup.svelte"

  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  let loading = false
  let value = ""

  const importElement = async (filename: string) => {
    loading = true

    const response = await fetch(
      `https://stash.hera.lan/api/cluster/${$page.data.cluster.id}/import`,
      {
        method: "POST",
        body: JSON.stringify({
          filename,
          selectedTags: mediaController.selectedTags.map(t => t.id)
        })
      }
    )

    if (response.ok)
      setTimeout(() => {
        loading = false
      }, 200)
    else throw "Something went wrong with the import"
  }

  const getPromise = async (loading: boolean) => {
    return fetch(`https://stash.hera.lan/api/cluster/-1/import`)
      .then(res => res.json())
      .then(d => d as string[])
  }
  $: promise = getPromise(loading)
</script>

{#if loading}
  <Popup hideHeader>
    <!-- TODO: Loading spinner -->
    <b>Loading...</b>
  </Popup>
{:else}
  <FuzzyPopupTemplate
    {promise}
    searchAttributes={[""]}
    bind:value
    onselected={a => importElement(a)}
    disableClose
    onclose={() => {
      mediaController.updateMedia()
      // TODO: invalidate Tags
    }}
  >
    {#snippet children(result)}
      <span>{result}</span>
    {/snippet}
  </FuzzyPopupTemplate>
{/if}
