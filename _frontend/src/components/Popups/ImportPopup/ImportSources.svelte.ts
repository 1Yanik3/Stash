import { page } from "$app/state"
import type { TagExtended } from "$lib/controllers/TagsController.svelte"
import type { possibleIcons } from "$lib/possibleIcons"

interface importParams {
    cluster: string
    tags: TagExtended[]
}

export abstract class ImportSource {
    abstract icon: keyof typeof possibleIcons

    protected abstract import(p: importParams): Promise<void>

    filename: string
    size: number
    progress = $state(0)
    error = $state("")

    constructor(
        public params: {
            filename: string
            size: number
        }
    ) {
        this.filename = params.filename
        this.size = params.size
    }

    async process(p: importParams): Promise<void> {
        try {
            this.progress = 1
            await this.import(p)
            this.progress = 100
        } catch (error: any) {
            console.error(error)
            this.error = error.message
        }
    }
}

export class UploadImportSource extends ImportSource {
    public icon = "mdiUpload" as const

    private file: File

    constructor(file: File) {
        if (!file) throw new Error("File is required")
        if (!file.name) throw new Error("File name is required")
        if (!file.size) throw new Error("File size is required")

        super({
            filename: file.name,
            size: file.size
        })

        this.file = file
    }

    async import(p: importParams): Promise<void> {
        this.progress = 0

        const data = new FormData()
        data.append("file", this.file)
        data.append("selectedTags", JSON.stringify(p.tags.map(t => t.id)))

        await new Promise((resolve, reject) => {
            let ajax = new XMLHttpRequest()
            ajax.addEventListener(
                "progress",
                e => (this.progress = Math.round((e.loaded / e.total) * 100)),
                false
            )
            ajax.addEventListener("load", resolve, false)
            ajax.addEventListener("error", reject, false)
            ajax.addEventListener("abort", reject, false)
            ajax.open(
                "POST",
                `${page.data.serverURL}/api/cluster/${p.cluster}/media`
            )
            ajax.send(data)
        })
    }
}

export class ImportablesImportSource extends ImportSource {
    public icon = "mdiImport" as const

    constructor(filename: string, size: number) {
        super({ filename, size })
    }

    async import(p: importParams): Promise<void> {
        throw new Error("Method not implemented.")
    }
}

export class TransmissionImportSource extends ImportSource {
    public icon = "mdiTransmissionTower" as const

    constructor(filename: string, size: number) {
        super({ filename, size })
    }

    async import(p: importParams): Promise<void> {
        throw new Error("Method not implemented.")
    }
}
