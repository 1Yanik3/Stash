import * as mdns from "./mdns"
import * as media from "./media"
import * as tags from "./tags"

export default {
  ...tags,
  ...media,
  ...mdns
}
