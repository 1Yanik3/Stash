export interface Group {
    id:         number
    name:       string
    icon?:      string
    children:   Array<Group>
    collapsed:     boolean
}

export interface Cluster {
    id:     number,
    name:   string
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
}
