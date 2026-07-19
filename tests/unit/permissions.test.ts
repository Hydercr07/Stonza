import { describe, expect, it } from "vitest";
import { canRole, canTransitionProductStatus } from "@/lib/permissions";

describe("permissions", () => {
  it("allows owner to publish products", () => {
    expect(canRole("owner", "products:publish")).toBe(true);
  });

  it("prevents inventory manager from editing settings", () => {
    expect(canRole("inventory_manager", "settings:write")).toBe(false);
  });

  it("enforces valid product status transitions", () => {
    expect(canTransitionProductStatus("draft", "published")).toBe(true);
    expect(canTransitionProductStatus("sold", "published")).toBe(false);
  });
});
