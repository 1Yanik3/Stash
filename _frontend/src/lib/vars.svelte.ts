class Vars {
  public clusterName: string | undefined = $state()
  public thumbnailSuffixParameter: {
    mediaId: string
    suffix: string
  } | null = $state(null)
}

export default new Vars()
