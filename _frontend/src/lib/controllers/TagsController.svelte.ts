import { get } from "svelte/store"

import { page } from "$app/stores"
import query from "$lib/client/call"
import type { possibleIcons } from "$lib/possibleIcons"
import { activeSetMethod, mediaTypeFilter, traverse } from "$lib/stores"

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

export default class TagsController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("TagsController already initialized!")
      return
    }

    this.alreadyInitialized = true
    this.updateTags()
  }

  public tags_flat: TagExtended[] = $state([])
  public tags_hierarchy: TagExtended[] = $state([])

  public updateTags = async (
    newClusterName: string = get(page).params.cluster
  ) => {
    this.updateHierarchicalTags(
      await query("tags_query_from_database", {
        cluster: newClusterName,
        favouritesOnly: mediaController.filters.favouritesOnly,
        mediaTypeFilter: get(mediaTypeFilter)
      })
    )
  }

  private updateHierarchicalTags = async (data: TagBase[]) => {
    const tagMap: { [key: string]: TagExtended } = {}

    // Step 1: Create a map of all tags
    data.forEach(tag => {
      tagMap[tag.id] = {
        ...tag,
        children: [],
        indirectCount: 0
      }
    })

    this.tags_flat = Object.values(tagMap)

    // Step 2: Build the hierarchy
    const result: TagExtended[] = []
    data.forEach(tag => {
      if (tag.parentId === null) {
        result.push(tagMap[tag.id])
      } else {
        if (!tagMap[tag.parentId]) {
          console.error("Tag with ID", tag.id, "does not exist")
          return
        }
        tagMap[tag.parentId].children.push(tagMap[tag.id])
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
        calculateIndirectCounts(tagMap[tag.id])
      }
    })

    this.tags_hierarchy = result.sort((a, b) =>
      get(page).params.cluster == "Camp Buddy"
        ? b.tag.localeCompare(a.tag)
        : b.count + b.indirectCount - (a.count + a.indirectCount)
    )
  }

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

    this.updateTags()
  }
}

export const tagsController = new TagsController()
