export interface Group {
    id:         number
    name:       string
    icon?:      string
    children:   Array<Group>
    collapsed:     boolean
}

export interface Tag {
    name: string
    count: number
    active: boolean
}

import { mdiSort, mdiSortAlphabeticalAscending, mdiSortAlphabeticalDescending, mdiSortCalendarAscending, mdiSortCalendarDescending } from '@mdi/js'
import type { Media as m } from '@prisma/client'

type Media = m & { date: number }

export const sortingMethods = [
    {
        icon: mdiSortAlphabeticalAscending,
        method: (a: Media, b: Media) => a.name.localeCompare(b.name)
    },
    {
        icon: mdiSortAlphabeticalDescending,
        method: (a: Media, b: Media) => b.name.localeCompare(a.name)
    },
    {
        icon: mdiSortCalendarAscending,
        method: (a: Media, b: Media) => a.date - b.date
    },
    {
        icon: mdiSortCalendarDescending,
        method: (a: Media, b: Media) => b.date - a.date
    },
    {
        icon: mdiSort,
        method: (a: Media, b: Media) => 0.5 - Math.random()
    }
]