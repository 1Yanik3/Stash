class Layout {
  isElectron = $state(false) as false | true | "fullscreen"
}

class Vars {
  public clusterName: string | undefined = $state()
  public thumbnailSuffixParameter: {
    mediaId: string
    suffix: string
  } | null = $state(null)

  public chaptersOfStory: {
    name: string
    content: string
  }[] = $state([])
  public selectedChapterIndex: number = $state(0)

  public isInSubjectEditingMode: boolean = $state(false)

  layout = new Layout()
}

export default new Vars()
