import type { Media } from "@prisma/client"

import type { MediaType } from "./controllers/MediaController.svelte"

class Layout {
    isElectron = $state(false) as false | true | "fullscreen"
}

class Vars {
    public clusterName: string | undefined = $state()
    public thumbnailSuffixParameter: {
        mediaId: string
        suffix: string
    } | null = $state(null)

    // ========== State for reader ==========
    public chaptersOfStory: {
        name: string
        content: string
    }[] = $state([])
    public selectedChapterIndex: number = $state(0)

    // ========== Global states =========

    public selectedMedias: MediaType[] = $state([])

    // ========== Global modes ==========

    // When on, will overlay the current subject (count of people) onto the thumbnails
    // and will allow setting the subject count by pressing 1, 2, 3, or 4 on the keyboard
    public isInSubjectEditingMode: boolean = $state(false)

    layout = new Layout()
}

export default new Vars()
