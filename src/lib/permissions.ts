import type { AdminRole, ProductStatus } from "@/types/domain";

export type Permission =
  | "dashboard:view"
  | "products:write"
  | "products:publish"
  | "categories:write"
  | "collections:write"
  | "homepage:write"
  | "hero:write"
  | "settings:write"
  | "media:write";

export const rolePermissions: Record<AdminRole, Permission[]> = {
  owner: [
    "dashboard:view",
    "products:write",
    "products:publish",
    "categories:write",
    "collections:write",
    "homepage:write",
    "hero:write",
    "settings:write",
    "media:write",
  ],
  administrator: [
    "dashboard:view",
    "products:write",
    "products:publish",
    "categories:write",
    "collections:write",
    "homepage:write",
    "hero:write",
    "settings:write",
    "media:write",
  ],
  product_manager: ["dashboard:view", "products:write", "products:publish", "categories:write", "collections:write", "media:write"],
  content_editor: ["dashboard:view", "homepage:write", "hero:write", "settings:write"],
  order_manager: ["dashboard:view"],
  inventory_manager: ["dashboard:view", "products:write"],
};

export function canRole(role: AdminRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function canTransitionProductStatus(from: ProductStatus, to: ProductStatus) {
  const transitions: Record<ProductStatus, ProductStatus[]> = {
    draft: ["published", "scheduled", "archived", "trash"],
    published: ["draft", "reserved", "out_of_stock", "sold", "archived", "trash"],
    scheduled: ["published", "draft", "archived", "trash"],
    reserved: ["published", "sold", "archived", "trash"],
    out_of_stock: ["published", "archived", "trash"],
    sold: ["archived", "trash"],
    archived: ["draft", "published", "trash"],
    trash: ["draft", "archived"],
  };

  return transitions[from].includes(to);
}
