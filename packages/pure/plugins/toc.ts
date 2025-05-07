import type { MarkdownHeading } from 'astro'

export interface TocItem extends MarkdownHeading {
  subheadings: TocItem[]
}

function diveChildren(item: TocItem, depth: number): TocItem[] {
  if (depth === 1 || !item.subheadings.length) {
    return item.subheadings
  } else {
    // e.g., 2
    return diveChildren(item.subheadings[item.subheadings.length - 1] as TocItem, depth - 1)
  }
}

export function generateToc(headings: readonly MarkdownHeading[]) {
  // this ignores/filters out h1 element(s)
  const bodyHeadings = [...headings.filter(({ depth }) => depth > 1)]
  const toc: TocItem[] = []

  bodyHeadings.forEach((h) => {
    const heading: TocItem = { ...h, subheadings: [] }

   
    if (heading.depth === 2 || toc.length === 0) {
      // 如果是 H2 或者 toc 还没有内容（没有 H2 也能作为一级目录）
      toc.push(heading)
    } else {
      const lastItemInToc = toc[toc.length - 1]!

      if (lastItemInToc && heading.depth < lastItemInToc.depth) {
        // 这里可以改成自动插入而不是直接throw
        // throw new Error(`Orphan heading found: ${heading.text}.`)
        toc.push(heading)
        return
      }

      const gap = heading.depth - lastItemInToc.depth
      const target = diveChildren(lastItemInToc, gap)
      target.push(heading)
    }
  })
  return toc
}
