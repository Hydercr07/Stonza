import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "ul",
];

const ALLOWED_ATTR = ["alt", "class", "href", "src", "title"];

/**
 * Sanitizes admin-authored rich text (journal posts, product/category
 * descriptions, managed pages) before it is rendered with
 * `dangerouslySetInnerHTML`.
 *
 * Was previously backed by isomorphic-dompurify (DOMPurify + jsdom), but
 * jsdom's dynamic requires aren't fully captured by Vercel's serverless
 * function file-tracing -- it worked in local `next build`/`next start`
 * (full node_modules present) and crashed with an empty 500 in the actual
 * deployed Lambda on every route that rendered rich text (product,
 * category, journal, and every CMS-managed static page). sanitize-html has
 * no DOM/jsdom dependency, so it has no such traced-file gap.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  const source = typeof input === "string" ? input : "";
  if (!source.trim()) return "";

  return sanitizeHtmlLib(source, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { "*": ALLOWED_ATTR },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowProtocolRelative: false,
  });
}
