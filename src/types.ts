
import type { possibleIcons } from "$lib/possibleIcons";
import type { Prisma } from '@prisma/client'

export const sortingMethods: Array<{ icon: keyof typeof possibleIcons, orderBy?: string, id?: string }> = [
    {
        icon: "mdiSortAlphabeticalAscending",
        orderBy: `"Media"."name" ASC`
    },
    {
        icon: "mdiSortAlphabeticalDescending",
        orderBy: `"Media"."name" DESC`
    },
    {
        icon: "mdiSortCalendarAscending",
        orderBy: `"Media"."date" ASC`
    },
    {
        icon: "mdiSortCalendarDescending",
        orderBy: `"Media"."date" DESC`
    },
    {
        icon: "mdiSort",
        id: "Random",
        orderBy: `RANDOM()`
    }
]