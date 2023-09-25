<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import { selectedTags } from "../../../lib/stores";
    import Popup from "../../../reusables/Popup.svelte";
    import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte";

    let loading = false;

    const importElement = async (filename: string) => {
        loading = true;

        const response = await fetch(
            `/cluster/${$page.data.cluster.id}/import`,
            {
                method: "POST",
                body: JSON.stringify({
                    filename,
                    selectedTags: $selectedTags
                }),
            }
        );

        if (response.ok) loading = false;
        else throw "Something went wrong with the import";
    };

    $: promise = fetch(`/api/cluster/-1/import`)
        .then((res) => res.json())
        .then((d) => d as string[]);
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
        let:result
        on:selected={({ detail }) => importElement(detail)}
        disableClose
        on:close={() => invalidate("media")}
    >
        <span>{result}</span>
    </FuzzyPopupTemplate>
{/if}
