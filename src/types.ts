
import type { possibleIcons } from "$lib/possibleIcons";

export const sortingMethods: Array<{ icon: keyof typeof possibleIcons, orderBy?: string, id?: string }> = [
    {
        icon: "mdiSortAlphabeticalAscending",
        orderBy: `m."name" ASC`
    },
    {
        icon: "mdiSortAlphabeticalDescending",
        orderBy: `m."name" DESC`
    },
    {
        icon: "mdiSortCalendarAscending",
        orderBy: `m."date" ASC`
    },
    {
        icon: "mdiSortCalendarDescending",
        orderBy: `m."date" DESC`
    },
    {
        icon: "mdiSort",
        id: "Random",
        orderBy: `RANDOM()`
    }
]