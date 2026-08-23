import DOMPurify from "isomorphic-dompurify";

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
 * `dangerouslySetInnerHTML`. Backed by DOMPurify — a battle-tested parser
 * that actually builds a DOM tree to sanitize, rather than a hand-rolled
 * regex pass, which is a well-known way to end up with a bypassable filter.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  const source = typeof input === "string" ? input : "";
  if (!source.trim()) return "";

  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}
