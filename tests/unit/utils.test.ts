import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("creates clean URL slugs", () => {
    expect(slugify(" Noir Obsidian Heart ")).toBe("noir-obsidian-heart");
    expect(slugify("STONE & LIGHT")).toBe("stone-light");
  });
});
