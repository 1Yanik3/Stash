<script lang="ts">
  import { page } from "$app/stores"
  import { controller, selectedTags } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"
  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  let loading = false
  let value = ""

  const importElement = async (filename: string) => {
    loading = true

    const response = await fetch(
      `/api/cluster/${$page.data.cluster.id}/import`,
      {
        method: "POST",
        body: JSON.stringify({
          filename,
          selectedTags: $selectedTags
        })
      }
    )

    if (response.ok) loading = false
    else throw "Something went wrong with the import"
  }

  const getPromise = async (loading: boolean) => {
    return fetch(`/api/cluster/-1/import`)
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
    let:result
    on:selected={({ detail }) => importElement(detail)}
    disableClose
    on:close={() => {
      $controller.mediaController.updateMedia()
      // TODO: invalidate Tags
    }}
  >
    <span>{result}</span>
  </FuzzyPopupTemplate>
{/if}
