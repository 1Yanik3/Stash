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
}

export default new Vars()
