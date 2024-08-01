import { get } from "svelte/store"

import { page } from "$app/stores"
import { collapsedTags } from "$lib/stores"

export default class CollapsedTagsController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("collapsedTagsController already initialized!")
    }

    this.loadCollapsedTags(get(page).params.cluster)

    let previouslyProcessedClusterName = get(page).params.cluster
    page.subscribe(({ params }) => {
      if (params.cluster == previouslyProcessedClusterName) return

      this.loadCollapsedTags(params.cluster)
      previouslyProcessedClusterName = params.cluster
    })

    this.alreadyInitialized = true
  }

  private loadCollapsedTags = async (clusterName: string) => {
    console.debug("Loading collapsed tags")
    collapsedTags.set(
      await fetch(`/api/cluster/${clusterName}/tags/collapsed`).then(res =>
        res.json()
      )
    )
    console.log("Loaded collapsed tags", get(collapsedTags))
  }

  // TODO: Don't toggle collapsed tags if they have no children
  public toggleCollapsedTag = async (tag: string) => {
    if (get(collapsedTags).includes(tag.toLowerCase())) {
      collapsedTags.set(get(collapsedTags).filter(t => t !== tag.toLowerCase()))

      fetch(`/api/cluster/${get(page).params.cluster}/tags/collapsed`, {
        method: "DELETE",
        body: JSON.stringify({ tag: tag.toLowerCase() })
      }).catch(e => {
        console.error("Failed to remove tag from collapsed tags", e)
        collapsedTags.set([...get(collapsedTags), tag.toLowerCase()])
      })
    } else {
      collapsedTags.set([...get(collapsedTags), tag.toLowerCase()])

      fetch(`/api/cluster/${get(page).params.cluster}/tags/collapsed`, {
        method: "POST",
        body: JSON.stringify({ tag: tag.toLowerCase() })
      }).catch(e => {
        console.error("Failed to add tag to collapsed tags", e)
        collapsedTags.set(
          get(collapsedTags).filter(t => t !== tag.toLowerCase())
        )
      })
    }
  }
}
