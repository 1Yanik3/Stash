import type {
  TagBase,
  TagExtended
} from "$lib/controllers/TagsController.svelte"

export default function assembleTagHierarchyMap(data: TagBase[]) {
  const tagMap: Record<number, TagExtended> = {}

  // Step 1: Create a map of all tags
  data.forEach(tag => {
    tagMap[tag.id] = {
      ...tag,
      children: [],
      indirectCount: 0,
      indirectIcon: null
    }
  })

  // Step 2: Build the hierarchy
  data.forEach(tag => {
    if (tag.parentId != null) {
      if (!tagMap[tag.parentId]) {
        console.error("Tag with ID", tag.id, "does not exist")
        return
      }
      tagMap[tag.parentId].children.push(tagMap[tag.id])
    }
  })

  // Step 3: Pass down indirect icons
  const passDownIndirect = (tag: TagExtended) => {
    tag.children.forEach(c => {
      if (tag.icon) c.indirectIcon = tag.icon
      else if (tag.indirectIcon) c.indirectIcon = tag.indirectIcon
      passDownIndirect(c)
    })
  }
  Object.values(tagMap).forEach(passDownIndirect)

  return tagMap
}
