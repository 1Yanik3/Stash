import { parse } from "node-html-parser"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { query } = await request.json()

  const response = await fetch(
    `https://www.gaymaletube.com/cat/${query}?pricing=free`
  )
  const data = await response.text()

  const dom = parse(data)

  const cards = dom.querySelectorAll(".card.sub")

  const resulting = cards.map(result => ({
    title: result.querySelector("h3")?.getAttribute("title"),
    url: `https://www.gaymaletube.com${result
      .querySelector(".item-link")
      ?.getAttribute("href")}`,
    thumbnail: result.querySelector("img")?.getAttribute("src"),
    duration: result.querySelector(".duration-badge")?.text.replace("HD", "")
  }))

  return new Response(JSON.stringify(resulting))
}
