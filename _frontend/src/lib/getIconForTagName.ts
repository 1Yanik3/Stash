import { page } from "$app/stores"
import { derived } from "svelte/store"

import { PageData } from "../routes/[cluster]/$types"
import { possibleIcons } from "./possibleIcons"
import { collapsedTags } from "./stores"

export default (tagName: string) =>
  derived([page, collapsedTags], ([$page, $collapsedTags]) =>
    $collapsedTags.includes(tagName.toLowerCase())
      ? "mdiFolderHidden"
      : (Object.entries(($page.data as PageData).tagIcons).find(
          ([key, values]) => {
            if (values.includes(tagName.toLowerCase())) {
              return key as keyof typeof possibleIcons
            }
          }
        )?.[0] as keyof typeof possibleIcons) || "mdiFolderOutline"
  )
