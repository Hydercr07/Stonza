import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/sanitize";

describe("sanitizeHtml", () => {
  it("removes script tags and event handlers while preserving safe markup", () => {
    const input = `
      <div onclick="alert(1)">
        <script>alert('x')</script>
        <p>Hello <strong>world</strong> <a href="https://example.com" onclick="alert(2)">link</a></p>
      </div>
    `;

    const sanitized = sanitizeHtml(input);

    expect(sanitized).not.toContain("<script");
    expect(sanitized).not.toContain("onclick=");
    expect(sanitized).toContain("<p>");
    expect(sanitized).toContain("<strong>");
    expect(sanitized).toContain("https://example.com");
  });

  it("strips dangerous protocols and leaves ordinary text alone", () => {
    const input = '<a href="javascript:alert(1)">bad</a><a href="https://example.com">good</a>';

    const sanitized = sanitizeHtml(input);

    expect(sanitized).toContain("https://example.com");
    expect(sanitized).not.toContain("javascript:");
  });
});
