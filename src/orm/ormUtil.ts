export function wrapUrlIfLink(value: any, link?: string | null) {
  return link ? `[url=${link}]${value}[/url]` : value;
}
