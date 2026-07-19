import { describe, expect, it } from "vitest";
import { isAllowedMediaSize, isAllowedMediaType } from "@/lib/media";

describe("media validation", () => {
  it("accepts supported media types", () => {
    expect(isAllowedMediaType("image/png")).toBe(true);
    expect(isAllowedMediaType("application/x-msdownload")).toBe(false);
  });

  it("enforces size limits", () => {
    expect(isAllowedMediaSize(1024)).toBe(true);
    expect(isAllowedMediaSize(25 * 1024 * 1024)).toBe(false);
  });
});
