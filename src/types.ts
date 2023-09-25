
import type { possibleIcons } from "$lib/possibleIcons";
import type { Prisma } from '@prisma/client'

export const sortingMethods: Array<{ icon: keyof typeof possibleIcons, orderBy?: Prisma.MediaOrderByWithRelationInput, id?: string }> = [
    {
        icon: "mdiSortAlphabeticalAscending",
        orderBy: {
            name: "asc"
        }
    },
    {
        icon: "mdiSortAlphabeticalDescending",
        orderBy: {
            name: "desc"
        }
    },
    {
        icon: "mdiSortCalendarAscending",
        orderBy: {
            date: "asc"
        }
    },
    {
        icon: "mdiSortCalendarDescending",
        orderBy: {
            date: "desc"
        }
    },
    {
        icon: "mdiSort",
        id: "Random"
    }
]