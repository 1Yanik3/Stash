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

export interface Medium {
    id:     number
    type:   "video" | "image"
    name:   string
    date:   number
    tags:   Array<string>
    width:  number
    height: number
}

import { mdiSort, mdiSortAlphabeticalAscending, mdiSortAlphabeticalDescending, mdiSortCalendarAscending, mdiSortCalendarDescending } from '@mdi/js'
export const sortingMethods = [
    {
        icon: mdiSortAlphabeticalAscending,
        method: (a: Medium, b: Medium) => a.name.localeCompare(b.name)
    },
    {
        icon: mdiSortAlphabeticalDescending,
        method: (a: Medium, b: Medium) => b.name.localeCompare(a.name)
    },
    {
        icon: mdiSortCalendarAscending,
        method: (a: Medium, b: Medium) => a.date - b.date
    },
    {
        icon: mdiSortCalendarDescending,
        method: (a: Medium, b: Medium) => b.date - a.date
    },
    {
        icon: mdiSort,
        method: (a: Medium, b: Medium) => 0.5 - Math.random()
    }
]