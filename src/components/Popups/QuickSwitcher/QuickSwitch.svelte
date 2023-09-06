<script lang="ts">
    import { goto } from "$app/navigation";
    import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte";

    let data = fetch(`/api/group/all`)
        .then((res) => res.json())
        .then(
            (d) =>
                d as {
                    id: number;
                    name: number;
                    cluster: { id: number; name: string };
                }[]
        );
</script>

<FuzzyPopupTemplate
    promise={data}
    searchAttributes={["name", "cluster.name"]}
    let:result
    on:selected={({ detail }) => goto(`/${detail.cluster.name}/${detail.id}`)}
>
    <span>{result.name}</span>
    <span>{result.cluster.name}</span>
</FuzzyPopupTemplate>
