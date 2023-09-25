<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { selectedTags } from "../../../lib/stores";
    import type { PageData } from "../../../routes/[cluster]/$types";
    import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte";

    $: pageData = $page.data as PageData;
    $: data = (async () => {
        return pageData.tags
    })()
</script>

<FuzzyPopupTemplate
    promise={data}
    searchAttributes={["tag"]}
    let:result
    on:selected={({ detail }) => {
        // goto(`/${detail.cluster.name}/${detail.id}`)
        selectedTags.set([detail.tag.join("/")]);
    }}
>
    <span>{result.tag.join("/")}</span>
    <span>{result.count}</span>
</FuzzyPopupTemplate>
