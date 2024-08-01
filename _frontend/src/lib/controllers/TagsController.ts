import { get, Writable, writable } from "svelte/store"

import { afterNavigate } from "$app/navigation"
import { page } from "$app/stores"
import {
  activeSetMethod,
  favouritesOnly,
  mediaTypeFilter,
  selectedTags,
  traverse
} from "$lib/stores"

import { setMethods } from "../../types"

type TagData = {
  name: string
  count: number
  children: TagData
}[]

export default class TagsController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("TagsController already initialized!")
      return
    }
    selectedTags.subscribe(this.updateTags)
    traverse.subscribe(this.updateTags)
    activeSetMethod.subscribe(this.updateTags)
    favouritesOnly.subscribe(this.updateTags)
    mediaTypeFilter.subscribe(this.updateTags)

    // afterNavigate(() => {
    //   this.tags.set([])
    // })

    this.alreadyInitialized = true
  }

  public tags: Writable<
    {
      tag: string[]
      direct_count: number
      indirect_count: number
      tag_exists_in_collapsed_tags: boolean
    }[]
  > = writable([])

  public updateTags = async () => {
    const tagRequest = await fetch(
      `/api/cluster/${get(page).params.cluster}/tags?${new URLSearchParams({
        tags: get(selectedTags).join(","),
        activeSetMethod: setMethods.indexOf(get(activeSetMethod)).toString(),
        mediaTypeFilter: get(mediaTypeFilter),
        favouritesOnly: get(favouritesOnly).toString()
      }).toString()}`
    )

    this.tags.set(await tagRequest.json())
    this.updateHierarchicalTagsExceptPeople()
  }

  public hierarchicalTagsExceptPeople: Writable<TagData> = writable([])

  private updateHierarchicalTagsExceptPeople = async () => {
    let tagData: TagData = []

    get(this.tags)
      .filter(t => !["Solo", "Two", "Three", "Group"].includes(t.tag[0]))
      .sort((a, b) => a.tag.length - b.tag.length)
      .forEach(({ tag, direct_count, indirect_count }) => {
        const addAt = (at: TagData, i: number) => {
          if (!tag[i]) return

          const parent = at.find(t => t.name == tag[i])

          if (parent) {
            // Add as child
            addAt(parent.children, i + 1)
          } else {
            // Add as new
            const children: TagData = []
            at.push({
              name: tag[i],
              count: get(traverse)
                ? indirect_count + direct_count
                : direct_count,
              children
            })
            addAt(children, i + 1)
          }
        }

        addAt(tagData, 0)
      })

    this.hierarchicalTagsExceptPeople.set(
      tagData.sort((a, b) =>
        get(page).params.cluster == "Camp Buddy"
          ? b.name.localeCompare(a.name)
          : b.count - a.count
      )
    )
  }
}
