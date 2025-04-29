import { get } from "svelte/store"

import { goto } from "$app/navigation"
import { page } from "$app/stores"
import { SUBJECT_TYPES } from "$lib/constants"
import { mediaController } from "$lib/controllers/MediaController.svelte"
import {
  default as tagsController,
  type TagExtended
} from "$lib/controllers/TagsController.svelte"
import type { possibleIcons } from "$lib/possibleIcons"
import { actionBar, controller, selectedMediaIds } from "$lib/stores.svelte"
import varsSvelte from "$lib/vars.svelte"

import type { PageData } from "../../../routes/[cluster]/$types"
import { sortingMethods } from "../../../types"
import query from "../call"
import { updateSearcher, type ResultsType } from "./search.svelte"

let previousValue = ""

export const refreshFilters = (value: string = previousValue) => {
  previousValue = value

  let promises: (() => Promise<ResultsType>)[] = [
    actions,
    gatherAllTags,
    gatherAllFilters,
    gatherAllClusters
  ]

  if (value.startsWith("/")) promises = [actions]
  else if (value.startsWith("!")) promises = [gatherAllClusters]
  else if (value.startsWith("@")) promises = [gatherAllFilters]
  else if (value.startsWith("#")) promises = [gatherAllTags]

  Promise.all(promises.map(fn => fn())).then(data => {
    console.log("refreshed filters")
    updateSearcher(data.flat())
  })
}

const actions = async () => {
  const tags: ResultsType = [
    {
      icon: "mdiImport",
      label: "/Import",
      onEnter: () => {
        get(controller).setPopup("Quick Actions Import")
      }
    },
    {
      icon: "mdiCast",
      label: "/Cast",
      onEnter: () => {
        get(controller).setPopup(null)
        get(controller).setActionBar(get(actionBar) == "Cast" ? null : "Cast")
      }
    },
    {
      icon: "mdiViewGallery",
      label: "/Masonary",
      onEnter: () => {
        get(controller).setPopup("Masonary View")
      }
    },
    {
      icon: "mdiCounter",
      label: "/Bulk edit subject counts",
      onEnter: () => {
        get(controller).setPopup(null)
        varsSvelte.isInSubjectEditingMode = !varsSvelte.isInSubjectEditingMode
      }
    }
  ]

  return tags
}

const gatherAllTags = async () => {
  const tags: ResultsType = []

  const addTagAndChildrenToArray = (tag: TagExtended, parentPrefix = "") => {
    tags.push({
      icon: tag.icon || "mdiFolderOutline",
      label: `#${parentPrefix}${tag.tag}${tag.children.length ? "/" : ""}`,
      action: tag.count,
      onEnter: (e: KeyboardEvent) => {
        if (e.shiftKey) mediaController.selectedTags.push(tag)
        else mediaController.selectedTags = [tag]
        get(controller).setPopup(null)
      }
    })
    tag.children.forEach(child =>
      addTagAndChildrenToArray(child, `${tag.tag}/`)
    )
  }

  Object.values(tagsController.tagMap).forEach(tag =>
    addTagAndChildrenToArray(tag)
  )

  return tags
}

const gatherAllClusters = async () =>
  (get(page).data as PageData).clusters.map(
    cluster =>
      ({
        icon: cluster.icon as any,
        label: `!${cluster.name}`,
        onEnter: () => {
          goto(`/${cluster.name}`)
          get(controller).setPopup(null)
        }
      }) satisfies ResultsType[number]
  )

const createBasicFilterAction = <
  T extends keyof typeof mediaController.filters
>(
  property: T,
  value: (typeof mediaController.filters)[T],
  icon: any,
  propertyName?: string
) => ({
  icon,
  label: `@${propertyName || property}/${value}`,
  action: mediaController.filters[property] == value ? "ON" : "",
  onEnter: () => {
    // @ts-ignore
    mediaController.filters[property] = value
    refreshFilters()
  }
})

const gatherAllFilters = async () =>
  [
    {
      icon: "mdiBackspace",
      label: "@clear",
      onEnter: () => {
        mediaController.selectedTags = []
        mediaController.filters.favouritesOnly = false
        mediaController.filters.activeSortingMethod = 0
        get(controller).setPopup(null)
      }
    },
    {
      icon: "mdiAllInclusive",
      label: "@all",
      onEnter: () => {
        mediaController.selectedTags = []
      }
    },
    {
      icon: mediaController.filters.favouritesOnly
        ? "mdiStar"
        : "mdiStarOutline",
      label: "@favourited",
      action: mediaController.filters.favouritesOnly ? "ON" : "OFF",
      onEnter: () => {
        mediaController.filters.favouritesOnly =
          !mediaController.filters.favouritesOnly
        refreshFilters()
      }
    },
    ...sortingMethods.map((s, i) => ({
      icon: s.icon,
      label: `@sort/${s.title}`,
      action:
        mediaController.filters.activeSortingMethod == i ? "ON" : undefined,
      onEnter: () => {
        if (
          i == mediaController.filters.activeSortingMethod &&
          sortingMethods[mediaController.filters.activeSortingMethod].id ==
            "Random"
        ) {
          mediaController.filters.seed = Math.random()
          console.log("seed")
        } else {
          mediaController.filters.activeSortingMethod = i
          refreshFilters()
        }
      }
    })),
    createBasicFilterAction("mediaType", "all", "mdiMultimedia", "type"),
    createBasicFilterAction("mediaType", "image", "mdiImage", "type"),
    createBasicFilterAction("mediaType", "video", "mdiVideo", "type"),
    {
      icon: "mdiPound",
      label: "@minResolution",
      action: mediaController.filters.minResolution || "",
      submenu: [
        { res: null, icon: "mdiAllInclusive" },
        { res: 720, icon: "mdiStandardDefinition" },
        { res: 1080, icon: "mdiHighDefinition" },
        { res: 2160, icon: "mdiVideo4kBox" }
      ].map(({ res, icon }) => ({
        label: `@minResolution/${res}`,
        icon: icon as keyof typeof possibleIcons,
        onEnter: () => {
          mediaController.filters.minResolution = res
          refreshFilters()
        }
      }))
    },
    ...SUBJECT_TYPES.map(({ value, icon }) =>
      createBasicFilterAction("specialFilterAttribute", value, icon, "subject")
    ),
    {
      icon: "mdiPound",
      label: "@numberOfTags",
      action: mediaController.filters.countOfTags || "",
      submenu: [
        { value: -1, name: "All", icon: "mdiAllInclusive" },
        { value: 0, name: "0", icon: "mdiNumeric0" },
        { value: 1, name: "1", icon: "mdiNumeric1" },
        { value: 2, name: "2", icon: "mdiNumeric2" },
        { value: 3, name: "3", icon: "mdiNumeric3" }
      ].map(({ value, name, icon }) => ({
        label: `@numberOfTags/${name}`,
        icon: icon as keyof typeof possibleIcons,
        onEnter: () => {
          mediaController.filters.countOfTags = value
          refreshFilters()
        }
      }))
    }
  ] satisfies ResultsType
