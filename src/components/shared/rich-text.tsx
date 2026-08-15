import DOMPurify from "isomorphic-dompurify";

export function RichText({ html, className = "" }: { html: string | null | undefined; className?: string }) {
  const safeHtml = typeof html === "string" ? html : "";
  const clean = DOMPurify.sanitize(safeHtml);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
