import { get } from "svelte/store"

import { page } from "$app/stores"
import type { possibleIcons } from "$lib/possibleIcons"
import {
  activeSetMethod,
  favouritesOnly,
  mediaTypeFilter,
  traverse
} from "$lib/stores"

import { setMethods } from "../../types"

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
}

export default class TagsController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("TagsController already initialized!")
      return
    }

    $effect(() => {
      if (
        this.selectedTags ||
        // TODO: stop being stores
        traverse ||
        activeSetMethod ||
        favouritesOnly ||
        mediaTypeFilter
      )
        this.updateTags()
    })

    this.alreadyInitialized = true
  }

  public tags_flat: TagExtended[] = $state([])
  public tags_hierarchy: TagExtended[] = $state([])
  public selectedTags: TagExtended[] = $state([])

  public updateTags = async () => {
    const tagRequest = await fetch(
      `/api/cluster/${get(page).params.cluster}/tags?${new URLSearchParams({
        tags: this.selectedTags.map(t => t.id).join(","),
        activeSetMethod: setMethods.indexOf(get(activeSetMethod)).toString(),
        mediaTypeFilter: get(mediaTypeFilter),
        favouritesOnly: get(favouritesOnly).toString()
      }).toString()}`
    )

    this.updateHierarchicalTags(await tagRequest.json())
  }

  private updateHierarchicalTags = async (data: TagBase[]) => {
    const tagMap: { [key: string]: TagExtended } = {}

    // Step 1: Create a map of all tags
    data.forEach(tag => {
      tagMap[tag.id] = {
        ...tag,
        children: []
      }
    })

    this.tags_flat = Object.values(tagMap)

    // Step 2: Build the hierarchy
    const result: TagExtended[] = []
    data.forEach(tag => {
      if (tag.parentId === null) {
        result.push(tagMap[tag.id])
      } else {
        tagMap[tag.parentId].children.push(tagMap[tag.id])
      }
    })

    this.tags_hierarchy = result.sort((a, b) =>
      get(page).params.cluster == "Camp Buddy"
        ? b.tag.localeCompare(a.tag)
        : b.count - a.count
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
}

export const tagsController = new TagsController()
