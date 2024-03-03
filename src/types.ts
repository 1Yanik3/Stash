import type { possibleIcons } from "$lib/possibleIcons"

export const sortingMethods: Array<{
  icon: keyof typeof possibleIcons
  orderBy?: string
  id?: string
}> = [
  {
    icon: "mdiSortAlphabeticalAscending",
    orderBy: `"Media"."name" ASC, "Media"."id" ASC`
  },
  {
    icon: "mdiSortAlphabeticalDescending",
    orderBy: `"Media"."name" DESC, "Media"."id" DESC`
  },
  {
    icon: "mdiSortCalendarAscending",
    orderBy: `"Media"."date" ASC, "Media"."name" ASC, "Media"."id" ASC`
  },
  {
    icon: "mdiSortCalendarDescending",
    orderBy: `"Media"."date" DESC, "Media"."name" DESC, "Media"."id" DESC`
  },
  // TODO: Add a seed (so that no reload happens when I change a tag)
  {
    icon: "mdiSort",
    id: "Random",
    orderBy: `RANDOM()`
  }
]

export const setMethods: Array<{
  title: "OR" | "AND"
  icon: keyof typeof possibleIcons
}> = [
  {
    title: "OR",
    icon: "mdiSetAll"
  },
  {
    title: "AND",
    icon: "mdiSetCenter"
  }
]
