<script lang="ts">

    import type { Group, Tag, Medium } from './types'
    import { mdiArchive, mdiImage, mdiTrashCan, mdiVideo } from '@mdi/js'

    import { serverURL, clusters, cluster, groups, group, tags, traverse, mediaTypeFilter, activeSortingMethod, media, visibleMedium } from './stores'
    import { page } from '$app/stores'
    import { browser } from '$app/env'
    import { onMount } from 'svelte'

    export const updateClusters = async () => {
        if (!browser) return

        console.log("Updating clusters...")
        try {
            const res = await fetch(`${serverURL}/clusters`)
            clusters.set(await res.json())
            cluster.set(
                $clusters.find(c => c.id == Number((new URL($page.url)).searchParams.get("c"))) || $clusters[0]
            )
        } catch (err) {
            console.error("failed to update clusters", err)
        }
    }

    export const updateGroups = async () => {
        if (!browser) return

        console.log("Updating groups...")
        try {

            const res = await fetch(`${serverURL}/${$cluster.id}/groups`)
            groups.set(

                (await res.json()).map((c: Group) => {

                    if (c.id == -1) c.icon = mdiArchive
                    if (c.id == -2) c.icon = mdiTrashCan

                    if (c.icon == "images") c.icon = mdiImage
                    if (c.icon == "videos") c.icon = mdiVideo

                    return c

                }).sort((a: Group, b: Group) => a.name.localeCompare(b.name))

            )

            const flattentedGroups: Array<Group> = []
            const flatten = (input: Group) => {

                if (input.children.length)
                    input.children.forEach(g => flatten(g))

                flattentedGroups.push(input)

            }
            $groups.forEach(g => flatten(g))

            group.set(
                flattentedGroups.find(g => g.id == Number((new URL($page.url)).searchParams.get("g"))) || $groups[1]
            )

        } catch (err) {
            console.error("failed to update groups", err)
        }
    }

    export const updateTags = async () => {
        if (!browser) return
        
        console.log("Updating tags...")
        try {

            let output: Array<Tag> = []

            const addToOutput = async (g: Group) => {
                const res = await fetch(`${serverURL}/${$cluster.id}/${g.id}/tags`)
                output = [ ...output, ...(await res.json()).map((t: any) => { t.active = false; return t }) ]

                if ($traverse)
                    for (const i in g.children)
                        await addToOutput(g.children[i])
            }
            await addToOutput($group)

            tags.set(output)
            
        } catch (err) {
            console.warn("failed to update tags", err)
        }
    }

    export const updateMedia = async () => {
        console.log("Updating media...")
        if ($cluster.id && $group.id) {
            try {

                let output: Array<Medium> = []

                const addToOutput = async (g: Group) => {
                    const res = await fetch(`${serverURL}/${$cluster.id}/${g.id}/media`)
                    output = [ ...output, ...await res.json() ]

                    if ($traverse)
                        for (const i in g.children)
                            await addToOutput(g.children[i])
                }
                await addToOutput($group)

                media.set(
                    output.filter(d => d.type.startsWith($mediaTypeFilter)).sort($activeSortingMethod.method)
                )                
                
            } catch (err) {
                console.error("failed to update media", err)
            }
        }
    }

    const clearTagSelection = () => tags.set(
        $tags.map(t => { t.active = false; return t })
    )
    $: if($page.url) clearTagSelection()

    updateClusters()
    cluster.subscribe(updateGroups)

    group.subscribe(g => updateMedia())
    group.subscribe(g => visibleMedium.set(null))
    group.subscribe(g => g.id > 0 && updateTags())

    traverse.subscribe(() => $traverse != undefined && updateMedia())
    traverse.subscribe(() => $traverse != undefined && updateTags())

    activeSortingMethod.subscribe(g => updateMedia())

    onMount(() => {
        traverse.set(localStorage.getItem('traverse') == "true")
    })

</script>