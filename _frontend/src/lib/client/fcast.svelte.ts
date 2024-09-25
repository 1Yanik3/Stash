import type { Media } from "@prisma/client"

export enum PlaybackStateState {
  PLAYING = 1,
  PAUSED = 2
}

type PlaybackState = {
  time: number
  state: PlaybackStateState
}

enum Opcode {
  None = 0,
  Play = 1,
  Pause = 2,
  Resume = 3,
  Stop = 4,
  Seek = 5,
  PlaybackUpdate = 6,
  VolumeUpdate = 7,
  SetVolume = 8,
  PlaybackError = 9
}

export class FCastController {
  private currentWebSocket: WebSocket | null = null
  public playbackState: PlaybackState | null = $state(null)
  private playbackStateUpdateTime: number | null = null
  private selectedHost: string | null = null

  private readonly LENGTH_BYTES = 4
  private readonly MAXIMUM_PACKET_LENGTH = 32 * 1024
  private readonly SessionState = {
    WaitingForLength: 0,
    WaitingForData: 1
  }

  private state = this.SessionState.WaitingForLength
  private packetLength = 0
  private bytesRead = 0
  private buffer = new Uint8Array(this.MAXIMUM_PACKET_LENGTH)

  constructor(ip: string, port: number = 46898) {
    const wsUrl = `https://stash.hera.lan/ws/${ip}/${port}`
    this.selectedHost = `${ip}:${port}`
    this.closeCurrentWebSocket()

    this.currentWebSocket = new WebSocket(wsUrl)
    this.currentWebSocket.onopen = this.onWebSocketOpen
    this.currentWebSocket.onerror = this.onWebSocketError
    this.currentWebSocket.onclose = this.onWebSocketClose
    this.currentWebSocket.onmessage = this.onWebSocketMessage
  }

  public disconnect = (): void => {
    this.closeCurrentWebSocket()
  }

  public play = (media: Media): void => {
    // TODO: Make configurable and dynamic
    const playMessage = {
      container: media.type,
      url: `https://stash.any.gay/file/${media.id}?session=udhmunznya`
    }
    if (media.type.startsWith("image")) {
        playMessage.container = "video/mp4"
        playMessage.url = `https://stash.any.gay/worker//${media.id}?session=udhmunznya`
    }
    this.sendWebSocketPacket(Opcode.Play, playMessage)
  }

  private playUrl = (url: string, type: string): void => {
    this.sendWebSocketPacket(Opcode.Play, { container: type, url })
  }

  public pause = (): void => {
    this.sendWebSocketPacket(Opcode.Pause, {})
  }

  public resume = (): void => {
    this.sendWebSocketPacket(Opcode.Resume, {})
  }

  public stop = (): void => {
    this.sendWebSocketPacket(Opcode.Stop, {})
  }

  public seek = (time: number): void => {
    this.sendWebSocketPacket(Opcode.Seek, { time })
  }

  private onWebSocketOpen = (): void => {
    console.log("WebSocket connection opened")
    // TODO
    // this.playUrl(
    //   "https://wallsdesk.com/wp-content/uploads/2017/01/Capybara-High-Definition-Wallpapers-.jpg",
    //   "image/jpeg"
    // )
  }

  private onWebSocketError = (error: Event): void => {
    console.error("WebSocket error:", error)
  }

  private onWebSocketClose = (event: CloseEvent): void => {
    console.log("WebSocket connection closed:", event.reason)
    if (this.selectedHost) {
      console.log("Attempting to reconnect...")
      setTimeout(() => new FCastController(this.selectedHost!), 1000)
    }
  }

  private onWebSocketMessage = (event: MessageEvent): void => {
    if (typeof event.data === "string") {
      console.log("Text message received, not handled:", event.data)
    } else {
      event.data.arrayBuffer().then((buffer: ArrayBuffer) => {
        const dataView = new DataView(buffer)
        this.handleWebSocketData(dataView, buffer.byteLength)
      })
    }
  }

  private handleWebSocketData = (dataView: DataView, length: number): void => {
    if (this.state === this.SessionState.WaitingForLength) {
      this.readLengthBytes(dataView, 0, length)
    } else if (this.state === this.SessionState.WaitingForData) {
      this.readPacketBytes(dataView, 0, length)
    } else {
      console.error("Invalid state encountered")
      this.reconnect()
    }
  }

  private readLengthBytes = (
    dataView: DataView,
    offset: number,
    count: number
  ): void => {
    const bytesToRead = Math.min(this.LENGTH_BYTES - this.bytesRead, count)
    const bytesRemaining = count - bytesToRead

    for (let i = 0; i < bytesToRead; i++) {
      this.buffer[this.bytesRead + i] = dataView.getUint8(offset + i)
    }

    this.bytesRead += bytesToRead

    if (this.bytesRead >= this.LENGTH_BYTES) {
      this.packetLength = dataView.getUint32(0, true)
      this.bytesRead = 0
      this.state = this.SessionState.WaitingForData

      if (this.packetLength > this.MAXIMUM_PACKET_LENGTH) {
        throw new Error("Maximum packet length exceeded")
      }

      if (bytesRemaining > 0) {
        this.readPacketBytes(dataView, offset + bytesToRead, bytesRemaining)
      }
    }
  }

  private readPacketBytes = (
    dataView: DataView,
    offset: number,
    count: number
  ): void => {
    const bytesToRead = Math.min(this.packetLength - this.bytesRead, count)
    const bytesRemaining = count - bytesToRead

    for (let i = 0; i < bytesToRead; i++) {
      this.buffer[this.bytesRead + i] = dataView.getUint8(offset + i)
    }

    this.bytesRead += bytesToRead

    if (this.bytesRead >= this.packetLength) {
      this.processPacket()

      this.state = this.SessionState.WaitingForLength
      this.packetLength = 0
      this.bytesRead = 0

      if (bytesRemaining > 0) {
        this.readLengthBytes(dataView, offset + bytesToRead, bytesRemaining)
      }
    }
  }

  private processPacket = (): void => {
    const opcode = this.buffer[0]
    const body =
      this.bytesRead > 1
        ? new TextDecoder().decode(this.buffer.slice(1, this.bytesRead))
        : null

    switch (opcode) {
      case Opcode.PlaybackUpdate:
        if (body) {
          this.handlePlaybackUpdate(body)
        }
        break

      case Opcode.PlaybackError:
        console.error("Playback error:", body)
        break

      default:
        console.log("Unhandled opcode:", opcode)
        break
    }
  }

  private handlePlaybackUpdate = (body: string): void => {
    try {
      const playbackUpdateMsg = JSON.parse(body)
      this.playbackState = playbackUpdateMsg
      this.playbackStateUpdateTime = Date.now()
    } catch (error) {
      console.error("Error parsing playback update:", error)
    }
  }

  private sendWebSocketPacket = (opcode: Opcode, payload: object): void => {
    if (!this.selectedHost) return

    console.log("Sending WebSocket packet:", opcode, payload)
    const body = this.createBody(payload)
    const header = this.createHeader(opcode, body.length)
    const packet = this.concatenateBuffers(header, body)
    this.sendPacketToHost(packet)
  }

  private createHeader = (opcode: Opcode, bodyLength: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    view.setUint32(0, bodyLength + 1, true) // little-endian
    view.setUint8(4, opcode)
    return buffer
  }

  private createBody = (jsonObject: object): Uint8Array => {
    const jsonString = JSON.stringify(jsonObject)
    return new TextEncoder().encode(jsonString)
  }

  private concatenateBuffers = (
    buffer1: ArrayBuffer,
    buffer2: Uint8Array
  ): ArrayBuffer => {
    const combined = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
    combined.set(new Uint8Array(buffer1), 0)
    combined.set(buffer2, buffer1.byteLength)
    return combined.buffer
  }

  private sendPacketToHost = (packet: ArrayBuffer): void => {
    if (!this.selectedHost) return

    const [host, port] = this.selectedHost.split(":")
    const wsUrl = `ws://${host}:${port}`
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      socket.send(packet)
      socket.close()
    }

    socket.onerror = error => {
      console.error("WebSocket error on send:", error)
    }
  }

  private closeCurrentWebSocket = (): void => {
    if (this.currentWebSocket) {
      this.currentWebSocket.close()
      this.currentWebSocket = null
    }
  }

  private reconnect = (): void => {
    if (this.selectedHost) {
      const [host, port] = this.selectedHost.split(":")
      new FCastController(host, parseInt(port))
    }
  }
}
