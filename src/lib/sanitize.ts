const ALLOWED_TAGS = new Set([
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
]);

const ALLOWED_ATTRS = new Set(["alt", "class", "href", "src", "title"]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripUnsafeUrls(value: string) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return "";
  }
  return trimmed;
}

export function sanitizeHtml(input: string | null | undefined): string {
  const source = typeof input === "string" ? input : "";
  if (!source.trim()) return "";

  const tagPattern = /<\/?[a-zA-Z0-9]+\b[^>]*>/g;
  const matches = source.match(tagPattern) ?? [];

  let sanitized = source;

  for (const match of matches) {
    const tagName = match.match(/^<\/?\s*([a-zA-Z0-9]+)/)?.[1]?.toLowerCase();
    if (!tagName) continue;

    if (match.startsWith("</")) {
      if (!ALLOWED_TAGS.has(tagName)) {
        sanitized = sanitized.replace(match, "");
      }
      continue;
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      sanitized = sanitized.replace(match, "");
      continue;
    }

    const attrPattern = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    const rewritten = match.replace(attrPattern, (attrMatch, attrName, doubleQuoted, singleQuoted, unquoted) => {
      const rawValue = doubleQuoted ?? singleQuoted ?? unquoted ?? "";
      const attr = attrName.toLowerCase();

      if (!ALLOWED_ATTRS.has(attr)) {
        return "";
      }

      if (attr === "href" || attr === "src") {
        const safeUrl = stripUnsafeUrls(rawValue);
        return safeUrl ? `${attr}="${escapeHtml(safeUrl)}"` : "";
      }

      return `${attr}="${escapeHtml(rawValue)}"`;
    });

    sanitized = sanitized.replace(match, rewritten);
  }

  return sanitized
    .replace(/<script\b[^>]*>.*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>.*?<\/style>/gi, "")
    .replace(/on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}
