<script lang="ts">
    import { invalidate, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import {
        controller,
        selectedMediaIds,
        selectedTags,
    } from "../../../lib/stores";
    import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte";

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

                    invalidate("media-and-tags");
                },
            });

        functionalities.push({
            name: "Import",
            async function() {
                $controller.setPopup("Quick Actions Import");
            },
        });

        functionalities.push({
            name: "Cast",
            async function() {
                $controller.setPopup(null);
                $controller.setActionBar("Cast");
            },
        });

        functionalities.push({
            name: "Rename Tag",
            async function() {
                const oldName = await $controller.prompt(
                    "What tag do you want to rename?",
                    $selectedTags.length == 1
                        ? ($selectedTags[0] as string)
                        : undefined
                );
                const newName = await $controller.prompt(
                    "Enter new name:",
                    oldName || ""
                );

                await fetch(
                    `/api/cluster/${$page.data.cluster.name}/tags/rename`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            oldName,
                            newName,
                        }),
                    }
                );

                invalidate("media-and-tags");
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
