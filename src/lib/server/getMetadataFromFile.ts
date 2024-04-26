import { execSync } from "child_process"

export default async (filename: string) => {
  const metadata = JSON.parse(
    execSync(`exiftool -api LargeFileSupport=1 -j ${filename}`).toString()
  )[0] as CombinedType

  return new Chainable(metadata)
    .run(convertTimeStringToSeconds)
    .run(v => convertStringToNumber(v, "ImageHeight", "height"))
    .run(v => convertStringToNumber(v, "ImageWidth", "width")).data
}

const convertTimeStringToSeconds = (input: CombinedType) => {
  if (!input.Duration) {
    input.duration = null
    return
  }

  const parts = input.Duration.split(":")
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  const seconds = parseInt(parts[2], 10) || 0

  input.duration = hours * 3600 + minutes * 60 + seconds
}

const convertStringToNumber = (
  input: ConvertedFields,
  sourceKey: keyof Metadata,
  targetKey: keyof ConvertedFields
) => {
  const value = (input as any)[sourceKey]
  input[targetKey] = parseInt(value, 10)
}

class Chainable {
  public data: CombinedType

  constructor(value: CombinedType) {
    this.data = value
  }

  public run(func: (data: CombinedType) => void): this {
    func(this.data)
    return this
  }
}

type CombinedType = Metadata & ConvertedFields

interface ConvertedFields {
  duration: number | null
  height: number
  width: number
}

interface Metadata {
  SourceFile: string
  ExifToolVersion: number
  FileName: string
  Directory: string
  FileSize: string
  FileModifyDate: string
  FileAccessDate: string
  FileInodeChangeDate: string
  FilePermissions: string
  FileType: string
  FileTypeExtension: string
  MIMEType: string
  MajorBrand: string
  MinorVersion: string
  CompatibleBrands: string[]
  MovieHeaderVersion: number
  CreateDate: string
  ModifyDate: string
  TimeScale: number
  Duration: string
  PreferredRate: number
  PreferredVolume: string
  PreviewTime: string
  PreviewDuration: string
  PosterTime: string
  SelectionTime: string
  SelectionDuration: string
  CurrentTime: string
  NextTrackID: number
  TrackHeaderVersion: number
  TrackCreateDate: string
  TrackModifyDate: string
  TrackID: number
  TrackDuration: string
  TrackLayer: number
  TrackVolume: string
  ImageWidth: number
  ImageHeight: number
  GraphicsMode: string
  OpColor: string
  CompressorID: string
  SourceImageWidth: number
  SourceImageHeight: number
  XResolution: number
  YResolution: number
  BitDepth: number
  PixelAspectRatio: string
  VideoFrameRate: number
  MatrixStructure: string
  MediaHeaderVersion: number
  MediaCreateDate: string
  MediaModifyDate: string
  MediaTimeScale: number
  MediaDuration: string
  MediaLanguageCode: string
  HandlerDescription: string
  Balance: number
  AudioFormat: string
  AudioChannels: number
  AudioBitsPerSample: number
  AudioSampleRate: number
  HandlerType: string
  HandlerVendorID: string
  Encoder: string
  MediaDataSize: number
  MediaDataOffset: number
  ImageSize: string
  Megapixels: number
  AvgBitrate: string
  Rotation: number
}
