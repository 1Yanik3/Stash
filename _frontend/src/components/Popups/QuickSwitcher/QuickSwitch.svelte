<script lang="ts">
  import { tagsController } from "$lib/controllers/TagsController.svelte"

  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  const promise = (async () => {
    return tagsController.tags_flat
  })()
</script>

<FuzzyPopupTemplate
  {promise}
  searchAttributes={["tag"]}
  onselected={d => {
    mediaController.filters.selectedTags = [d]
  }}
>
  {#snippet children(result)}
    <span style="text-transform: capitalize">{result.tag}</span>
    <span>{result.count}</span>
  {/snippet}
</FuzzyPopupTemplate>
