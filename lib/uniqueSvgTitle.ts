/**
 * Injects a unique title identifier into an inline SVG string to avoid duplicate
 * `aria-labelledby` collisions when multiple instances of the same SVG appear
 * in the DOM. When rendering the returned string through `dangerouslySetInnerHTML`,
 * provide the same slug so the ids remain stable across renders.
 *
 * If the SVG already contains a matching id the string is returned unchanged.
 */
export function uniqueSvgTitle(svg: string, slug: string): string {
  if (!svg.includes("id=\"title\"")) {
    return svg;
  }

  const uniqueId = `title-${slug}`;
  return svg
    .replaceAll("id=\"title\"", `id="${uniqueId}"`)
    .replaceAll("aria-labelledby=\"title\"", `aria-labelledby="${uniqueId}"`);
}

export default uniqueSvgTitle;
