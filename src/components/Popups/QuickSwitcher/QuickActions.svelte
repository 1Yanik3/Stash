<script lang="ts">
    import { controller, selectedMediaIds } from "../../../lib/stores";
    import { page } from "$app/stores";
    import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte";
    import QuickActionsImport from "./QuickActions_Import.svelte";

    export let visible: boolean;
    
    let importPopupVisible = false

    type functionalitiesType = {
        name: string;
        function: () => Promise<void>;
    }[];
    let promise: Promise<functionalitiesType> = new Promise((resolve) => {
        const functionalities: functionalitiesType = [];

        if ($selectedMediaIds.length)
            functionalities.push({
                name: "Add tag",
                async function() {
                    const newTag = await $controller.prompt("Enter new tag: ");

                    for (const i in $selectedMediaIds) {
                        await fetch(`/api/media/${$selectedMediaIds[i]}/tag`, {
                            method: "PUT",
                            body: JSON.stringify({
                                name: newTag,
                            }),
                        }).catch(console.error);
                    }
                },
            });

        if ($page.data.group.id != $page.data.cluster.everythingGroupId)
            functionalities.push({
                name: "Import",
                async function() {
                    importPopupVisible = true
                },
            });

        resolve(functionalities);
    });
</script>

<FuzzyPopupTemplate
    {promise}
    searchAttributes={["name"]}
    let:result
    on:selected={({ detail }) => detail.function()}
>
    <span>{result.name}</span>
</FuzzyPopupTemplate>

{#if importPopupVisible}
<QuickActionsImport bind:visible />
{/if}