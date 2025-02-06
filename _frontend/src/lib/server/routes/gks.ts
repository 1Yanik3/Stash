import { parse } from "node-html-parser"

export type SeriesData = {
  title: string
  source: string
  chapters: URL[]
}

export type StoryData = {
  title: string
  source: string
  chapters: {
    title: string
    content: string
  }
}

const fetchPage = async (url: URL | string) => {
  const request = await fetch(url)
  if (!request.ok) {
    throw new Error(`Failed to fetch ${url}, got status ${request.status}`)
  }
  return await request.text()
}

const fetchPageAndParse = async (url: URL | string) => {
  return parse(await fetchPage(url))
}

const getSeriesData = async (url: URL): Promise<SeriesData> => {
  let pageHtml = await fetchPageAndParse(url)

  if (url.pathname.startsWith("/story")) {
    const seriesLink = pageHtml.querySelector(".storyData-seriesName")
    if (!seriesLink) {
      throw new Error("Failed to find series link to get to series page")
    }
    const seriesAnchorTag = seriesLink.closest("a")
    if (!seriesAnchorTag) {
      throw new Error("Failed to find anchor tag for series link")
    }
    url = new URL(seriesAnchorTag.getAttribute("href") || "", url.origin)
    pageHtml = await fetchPageAndParse(url)
  }

  const titleElement = pageHtml.querySelector("#title-span")
  if (!titleElement) {
    throw new Error("Failed to find series title")
  }
  const title = titleElement.text.trim()

  const listItems = pageHtml.querySelectorAll(
    ".list-group-item .storyTitle a.storyLink"
  )
  return {
    title,
    source: url.href,
    chapters: listItems
      .map(item => item.getAttribute("href") || "")
      .map(href => new URL(href, url.origin))
  }
}

const getStoryData = async (url: URL): Promise<StoryData["chapters"]> => {
  const pageSource = await fetchPage(url)

  const title = pageSource.match(/shareTitle: `([^`]+)`,/)
  const content = pageSource.match(/storyText: `([^`]+)`,/)

  return {
    title: title ? title[1] : "Unknown",
    content: content ? content[1] : "Unknown"
  }
}

// : Promise<StoryData>
export const gks_fetch = async (d: { url: string }) => {
  const parsedURL = new URL(d.url)
  if (
    !parsedURL.pathname.startsWith("/story") &&
    !parsedURL.pathname.startsWith("/series")
  ) {
    throw new Error("Unsuported URL")
  }

  const seriesData = await getSeriesData(parsedURL)

  return {
    title: seriesData.title,
    source: seriesData.source,
    chapters: await Promise.all(seriesData.chapters.map(getStoryData))
  }
}
