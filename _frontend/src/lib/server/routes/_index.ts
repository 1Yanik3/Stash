import { _server_bulkAddTagToMedia } from "$lib/actions/addTagToMedia.svelte"
import { _server_bulkRemoveTagsFromMedia } from "$lib/actions/removeTagFromMedia.svelte"

import * as credentials from "./credentials"
import * as gks from "./gks"
import * as jobs from "./jobs"
import * as media from "./media"
import * as mediaQuery from "./media-query"
import * as stories from "./stories"
import * as tags from "./tags"

export default {
  ...tags,
  ...media,
  ...mediaQuery,
  ...gks,
  ...stories,
  ...jobs,
  ...credentials,
  _server_bulkAddTagToMedia,
  _server_bulkRemoveTagsFromMedia
}
