<script lang="ts">

    import { page } from '$app/stores'
    import { browser } from '$app/env'
    import { onMount } from 'svelte'
    import { mdiArchive, mdiImage, mdiTrashCan, mdiVideo } from '@mdi/js'

    import type { Group, Tag, Medium } from './types'
    import { serverURL, clusters, cluster, groups, group, tags, traverse, mediaTypeFilter, activeSortingMethod, media, visibleMedium } from './stores'

    import Shortcut from './reusables/Shortcut.svelte'

    const flattenGroups = () => {

        const flattentedGroups: Array<Group> = [
            $groups.find(g => g.id == -3) as Group,
            $groups.find(g => g.id == -1) as Group,
            $groups.find(g => g.id == -2) as Group
        ]

        const flatten = (input: Group) => {

            flattentedGroups.push(input)

            if (input.children.length)
                input.children.forEach(g => flatten(g))

        }
        $groups
        .filter(g => g.id > 0)
        .forEach(g => flatten(g))

        return(flattentedGroups)
    }

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

                }).sort((a: Group, b: Group) => $cluster.type == "collection" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name))

            )

            const flattentedGroups: Array<Group> = []
            const flatten = (input: Group) => {

                if (input.children.length)
                    input.children.forEach(g => flatten(g))

                flattentedGroups.push(input)

            }
            $groups.forEach(g => flatten(g))

            console.log((new URL($page.url)).searchParams.get("g"))
            group.set(
                flattentedGroups.find(g => g.id == Number((new URL($page.url)).searchParams.get("g"))) || $groups.find(g => g.id == -3) || $groups[0]
            )

        } catch (err) {
            console.error("failed to update groups", err)
        }
    }

    export const updateTags = async () => {
        if (!browser || !$cluster.id || !$group.id || $traverse == undefined) return
        
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
        if ($cluster.id && $group.id) {
            console.log("Updating media...")
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

                // todo: make better
                if ($cluster.type == "collection" && $group.id != -3) {
                    media.set(
                        output.filter(d => d.type.startsWith($mediaTypeFilter)).sort((a, b) => a.name.localeCompare(b.name))
                    )        
                } else {
                    media.set(
                        output.filter(d => d.type.startsWith($mediaTypeFilter)).sort($activeSortingMethod.method)
                    )        
                }
        
                
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
    cluster.subscribe(c => $cluster.id > 0 && updateGroups())

    group.subscribe(g => updateMedia())
    group.subscribe(g => visibleMedium.set(null))
    group.subscribe(g => g.id > 0 && updateTags())
    onMount(() => group.subscribe(g => history.pushState({}, "", `/?c=${$cluster.id}&g=${g.id}`)))

    traverse.subscribe(updateMedia)
    traverse.subscribe(updateTags)

    activeSortingMethod.subscribe(g => updateMedia())
    mediaTypeFilter.subscribe(g => updateMedia())

    onMount(() => {
        traverse.set(localStorage.getItem('traverse') == "true")
    })

    const shift = true, control = true, alt = true, opt = true, meta = true
</script>

<!-- Go up by a group -->
<Shortcut opt key="ArrowUp" action={() => {
    const flattenedGroups = flattenGroups()

    // @ts-ignore
    const currentGroupIndex = flattenedGroups.findIndex(g => g.id == $group.id)
    if (currentGroupIndex == 0)
        return
    $group = flattenedGroups[currentGroupIndex - 1]
}} />

<!-- Go down by a group -->
<Shortcut opt key="ArrowDown" action={() => {
    const flattenedGroups = flattenGroups()

    // @ts-ignore
    const currentGroupIndex = flattenedGroups.findIndex(g => g.id == $group.id)
    if (currentGroupIndex >= flattenedGroups.length - 1)
        return
    $group = flattenedGroups[currentGroupIndex + 1]
}} />

<!-- Go up by a cluster -->
<Shortcut shift opt key="ArrowUp" action={() => {
    // @ts-ignore
    const currentClusterIndex = $clusters.findIndex(c => c.id == $cluster.id)
    if (currentClusterIndex == 0)
        return
    cluster.set($clusters[currentClusterIndex - 1])
}} />

<!-- Go down by a cluster -->
<Shortcut shift opt key="ArrowDown" action={() => {
    // @ts-ignore
    const currentClusterIndex = $clusters.findIndex(c => c.id == $cluster.id)
    if (currentClusterIndex >= $clusters.length - 1)
        return
    cluster.set($clusters[currentClusterIndex + 1])
}} />