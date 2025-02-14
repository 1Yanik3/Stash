import * as gks from "./gks"
import * as media from "./media"
import * as mediaQuery from "./media-query"
import * as stories from "./stories"
import * as tags from "./tags"
import * as jobs from "./jobs"

export default {
  ...tags,
  ...media,
  ...mediaQuery,
  ...gks,
  ...stories,
  ...jobs
}
