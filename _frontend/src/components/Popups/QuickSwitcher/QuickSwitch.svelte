<script lang="ts">
  import { tagsController } from "$lib/controllers/TagsController.svelte"
  import { selectedTags } from "$lib/stores"

  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  const promise = (async () => {
    return tagsController.tags
  })()
</script>

<FuzzyPopupTemplate
  {promise}
  searchAttributes={["tag"]}
  onselected={({ tag }) => {
    selectedTags.set([tag.join("/").toLowerCase()])
  }}
>
  {#snippet children(result)}
    <span>{result.tag.join("/")}</span>
    <span>{result.direct_count}</span>
  {/snippet}
</FuzzyPopupTemplate>
