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
  let:result
  on:selected={({ detail }) => {
    selectedTags.set([detail.tag.join("/").toLowerCase()])
  }}
>
  <span>{result.tag.join("/")}</span>
  <span>{result.direct_count}</span>
</FuzzyPopupTemplate>
