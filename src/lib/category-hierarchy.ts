export const sidebarCategoryHierarchy = [
  {
    parentSlug: "men",
    childSlugs: ["men-rings", "men-bracelets-chains", "men-stones"],
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
] as const;

export const sidebarParentCategorySlugs = sidebarCategoryHierarchy.map((entry) => entry.parentSlug);

export const sidebarChildCategorySlugs = sidebarCategoryHierarchy.flatMap((entry) => entry.childSlugs);

export const sidebarAllowedCategorySlugs = new Set([
  ...sidebarParentCategorySlugs,
  ...sidebarChildCategorySlugs,
]);
