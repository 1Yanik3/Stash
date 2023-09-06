<script lang="ts">
    import { page } from "$app/stores";
    import Popup from "../../../reusables/Popup.svelte";
    import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte";

    let loading = false;

    const importElement = async (filename: string) => {
        loading = true;

        const response = await fetch(
            `/api/group/${$page.params.group}/import`,
            {
                method: "POST",
                body: JSON.stringify({
                    filename,
                }),
            }
        );

        if (response.ok) loading = false;
        else throw "Something went wrong with the import";
    };

    const promise = fetch(`/api/group/-1/import`)
        .then((res) => res.json())
        .then((d) => d as string[]);
</script>

<!-- TODO: on:close={() => invalidate("media-and-tags")} -->
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
    >
        <span>{result}</span>
    </FuzzyPopupTemplate>
{/if}
