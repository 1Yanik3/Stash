import { get } from "svelte/store"

import { page } from "$app/stores"
import query from "$lib/client/call"
import type { possibleIcons } from "$lib/possibleIcons"
import { mediaTypeFilter } from "$lib/stores"
import vars from "$lib/vars.svelte"

import { mediaController } from "./MediaController.svelte"
import { prompts } from "./PromptController"

export type TagBase = {
  id: number
  tag: string
  icon: keyof typeof possibleIcons | null
  collapsed: boolean
  parentId: number | null
  count: number
}

export type TagExtended = TagBase & {
  children: TagExtended[]
  indirectCount: number
}

export class TagsController {
  private alreadyInitialized = false

  public tagMap: Record<number, TagExtended> = $state({})

  public init = () => {
    if (this.alreadyInitialized) {
      console.log("TagsController already initialized!")
      return
    }

    this.alreadyInitialized = true
    // this.updateTags()

    $effect(() => {
      const clusterName = vars.clusterName
      console.log("updating with ", vars.clusterName)
      ;(async () => {
        if (!clusterName) {
          return {}
        }

        const data: TagBase[] = await query("tags_query_from_database", {
          cluster: clusterName,
          favouritesOnly: mediaController.filters.favouritesOnly,
          mediaTypeFilter: get(mediaTypeFilter)
        })

        const tmpTagMap: Awaited<typeof this.tagMap> = {}

        // Step 1: Create a map of all tags
        data.forEach(tag => {
          tmpTagMap[tag.id] = {
            ...tag,
            children: [],
            indirectCount: 0
          }
        })

        // Step 2: Build the hierarchy
        data.forEach(tag => {
          if (tag.parentId != null) {
            if (!tmpTagMap[tag.parentId]) {
              console.error("Tag with ID", tag.id, "does not exist")
              return
            }
            tmpTagMap[tag.parentId].children.push(tmpTagMap[tag.id])
          }
        })

        // Step 3: Calculate indirect counts
        const calculateIndirectCounts = (tag: TagExtended) => {
          tag.children.forEach(child => {
            calculateIndirectCounts(child)
            tag.indirectCount += child.count + child.indirectCount
          })
        }
        data.forEach(tag => {
          if (tag.parentId === null) {
            calculateIndirectCounts(tmpTagMap[tag.id])
          }
        })

        this.tagMap = tmpTagMap
      })()
    })
  }

  //   public updateTags = async (
  //     newClusterName: string = get(page).params.cluster
  //   ) => {
  //     this.updateHierarchicalTags(
  //       await query("tags_query_from_database", {
  //         cluster: newClusterName,
  //         favouritesOnly: mediaController.filters.favouritesOnly,
  //         mediaTypeFilter: get(mediaTypeFilter)
  //       })
  //     )
  //   }

  public toggleTag = (tag: TagBase, callback: (collapsed: boolean) => {}) => {
    callback(!tag.collapsed)

    fetch(`/api/tags/${tag.id}`, {
      method: "PATCH",
      body: JSON.stringify({ collapsed: !tag.collapsed })
    }).then(async res => {
      if (!res.ok) {
        console.error("Failed to toggle tag: ", await res.text())
        callback(tag.collapsed)
      }
    })
  }

  public createTag = async (parentTag: TagExtended | null = null) => {
    const name = await prompts.text("Enter the name of the new tag")
    if (!name) return

    // TODO: Icon

    await fetch(`/api/cluster/${get(page).params.cluster}/tags`, {
      method: "POST",
      body: JSON.stringify({
        name,
        parentId: parentTag ? parentTag.id : null
      })
    }).then(async res => {
      if (!res.ok) {
        console.error("Failed to create tag: ", await res.text())
      }
    })

    // this.updateTags()
  }
}

// const tagsController = new TagsController()

export default new TagsController()
