
import type { possibleIcons } from "$lib/possibleIcons"

export const sortingMethods: Array<{ icon: keyof typeof possibleIcons, orderBy?: string, id?: string }> = [
    {
        icon: "mdiSortAlphabeticalAscending",
        orderBy: `m."name" ASC, m."id" ASC`
    },
    {
        icon: "mdiSortAlphabeticalDescending",
        orderBy: `m."name" DESC, m."id" DESC`
    },
    {
        icon: "mdiSortCalendarAscending",
        orderBy: `m."date" ASC, m."name" ASC, m."id" ASC`
    },
    {
        icon: "mdiSortCalendarDescending",
        orderBy: `m."date" DESC, m."name" DESC, m."id" DESC`
    },
    {
        icon: "mdiSort",
        id: "Random",
        orderBy: `RANDOM()`
    }
]

export const setMethods: Array<{ title: "OR" | "AND", icon: keyof typeof possibleIcons }> = [
    {
        title: "OR",
        icon: "mdiSetAll",
    },
    {
        title: "AND",
        icon: "mdiSetCenter",
    },
]
