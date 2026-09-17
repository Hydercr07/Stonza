export const sidebarCategoryHierarchy = [
  {
    parentSlug: "men",
    childSlugs: ["men-rings", "men-bracelets-chains"],
  },
  {
    parentSlug: "women",
    childSlugs: [
      "women-rings",
      "women-bracelets",
      "women-jewellery-sets",
      "women-diamond",
      "women-diamond-nose-pin",
    ],
  },
  {
    // Standalone top-level category, not nested under Men or Women.
    parentSlug: "stones",
    childSlugs: [],
  },
] as const;

export const sidebarParentCategorySlugs = sidebarCategoryHierarchy.map((entry) => entry.parentSlug);

export const sidebarChildCategorySlugs = sidebarCategoryHierarchy.flatMap((entry) => entry.childSlugs);

export const sidebarAllowedCategorySlugs = new Set([
  ...sidebarParentCategorySlugs,
  ...sidebarChildCategorySlugs,
]);
