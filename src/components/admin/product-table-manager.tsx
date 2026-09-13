"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Search } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  bulkUpdateProductsAction,
  deleteProductAction,
  duplicateProductAction,
  quickUpdateProductAction,
} from "@/actions/admin";
import type { Category, Collection, Product } from "@/types/domain";
import { Button } from "@/components/shared/ui/button";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { formatMoney, getProductDisplayPrice } from "@/lib/utils";

function statusTone(status: Product["status"]) {
  if (status === "published") return "success";
  if (status === "draft" || status === "scheduled") return "warning";
  if (status === "trash" || status === "archived") return "danger";
  return "neutral";
}

export function ProductTableManager({
  products,
  categories,
  collections,
}: {
  products: Product[];
  categories: Category[];
  collections: Collection[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !normalized ||
        [
          product.name,
          product.sku,
          product.slug,
          product.collectionSlug,
          product.categorySlug,
          ...(product.tags ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [products, query, statusFilter]);

  const allVisibleSelected =
    filteredProducts.length > 0 && filteredProducts.every((product) => selectedIds.includes(product.id));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Store"
        title="Products"
        description="Search, filter, bulk-update, and quick-edit the catalog from one cleaner workspace."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        }
      />

      <AdminCard className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3">
            <Search className="h-4 w-4 text-[#8b7e70]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product name, SKU, slug, category, or collection"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#8b7e70]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-[#e7dfd1] bg-white px-4 py-3 text-sm text-[#171717]"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>

        <form action={bulkUpdateProductsAction} className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#ddd2c3] bg-[#fcfaf6] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(event) =>
                  setSelectedIds(
                    event.target.checked ? filteredProducts.map((product) => product.id) : [],
                  )
                }
              />
              <p className="text-sm text-[#5f564b]">
                {selectedIds.length ? `${selectedIds.length} selected` : "Select products to use bulk actions"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                name="bulkAction"
                defaultValue="publish"
                className="rounded-2xl border border-[#e7dfd1] bg-white px-4 py-3 text-sm text-[#171717]"
              >
                <option value="publish">Publish</option>
                <option value="draft">Move to draft</option>
                <option value="archive">Archive</option>
                <option value="feature">Feature</option>
                <option value="unfeature">Remove featured</option>
                <option value="set-category">Change category</option>
                <option value="set-collection">Change collection</option>
                <option value="delete">Delete</option>
              </select>
              <select
                name="bulkValue"
                defaultValue=""
                className="rounded-2xl border border-[#e7dfd1] bg-white px-4 py-3 text-sm text-[#171717]"
              >
                <option value="">No value</option>
                {categories.map((category) => (
                  <option key={`category-${category.id}`} value={category.slug}>
                    Category: {category.name}
                  </option>
                ))}
                {collections.map((collection) => (
                  <option key={`collection-${collection.id}`} value={collection.slug}>
                    Collection: {collection.name}
                  </option>
                ))}
              </select>
              {selectedIds.map((id) => (
                <input key={id} type="hidden" name={`product:${id}`} value="true" />
              ))}
              <Button variant="outline">Apply bulk action</Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-[#ece4d8]">
            <div className="hidden grid-cols-[40px_2.2fr_1fr_0.9fr_0.9fr_0.95fr_64px] gap-3 border-b border-[#ece4d8] bg-[#fcfaf6] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7e70] lg:grid">
              <span />
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Status</span>
              <span />
            </div>

            <div className="divide-y divide-[#f0e9df]">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <form
                    key={product.id}
                    action={quickUpdateProductAction}
                    className="grid gap-4 px-4 py-4 lg:grid-cols-[40px_2.2fr_1fr_0.9fr_0.9fr_0.95fr_64px] lg:items-center"
                  >
                    <input type="hidden" name="id" value={product.id} />
                    <label className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(event) =>
                          setSelectedIds((current) =>
                            event.target.checked
                              ? [...new Set([...current, product.id])]
                              : current.filter((id) => id !== product.id),
                          )
                        }
                      />
                    </label>

                    <div className="space-y-2">
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-[#171717] hover:text-[#9a6d2f]">
                        {product.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-[#6f6558]">
                        <span>{product.sku}</span>
                        {product.featured ? <AdminBadge tone="dark">Featured</AdminBadge> : null}
                        {product.newArrival ? <AdminBadge tone="neutral">New</AdminBadge> : null}
                      </div>
                    </div>

                    <select
                      name="categorySlug"
                      defaultValue={product.categorySlug}
                      className="rounded-2xl border border-[#e7dfd1] bg-white px-3 py-2 text-sm text-[#171717]"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <div className="grid gap-2">
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={getProductDisplayPrice(product)}
                        className="rounded-2xl border border-[#e7dfd1] bg-white px-3 py-2 text-sm text-[#171717]"
                      />
                      <p className="text-xs text-[#8b7e70]">{formatMoney(getProductDisplayPrice(product), product.currency)}</p>
                    </div>

                    <input
                      name="inventoryQuantity"
                      type="number"
                      defaultValue={product.inventoryQuantity}
                      className="rounded-2xl border border-[#e7dfd1] bg-white px-3 py-2 text-sm text-[#171717]"
                    />

                    <div className="space-y-2">
                      <select
                        name="status"
                        defaultValue={product.status}
                        className="rounded-2xl border border-[#e7dfd1] bg-white px-3 py-2 text-sm text-[#171717]"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="reserved">Reserved</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="sold">Sold</option>
                        <option value="archived">Archived</option>
                      </select>
                      <div className="flex items-center gap-2 text-xs text-[#6f6558]">
                        <input type="hidden" name="featured" value={product.featured ? "true" : "false"} />
                        <AdminBadge tone={statusTone(product.status)}>{product.status.replaceAll("_", " ")}</AdminBadge>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline">
                        Save
                      </Button>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e7dfd1] bg-white text-[#5f564b]"
                            aria-label={`More actions for ${product.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            sideOffset={6}
                            align="end"
                            className="z-50 min-w-[12rem] rounded-2xl border border-[#e7dfd1] bg-white p-1 shadow-[0_20px_45px_rgba(20,14,8,0.14)]"
                          >
                            <DropdownMenu.Item asChild>
                              <Link href={`/admin/products/${product.id}`} className="rounded-xl px-3 py-2 text-sm text-[#171717] outline-none hover:bg-[#f6f1e8]">
                                Edit
                              </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                              <Link href={`/stones/${product.slug}`} className="rounded-xl px-3 py-2 text-sm text-[#171717] outline-none hover:bg-[#f6f1e8]">
                                Preview
                              </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                              <button
                                type="submit"
                                formAction={duplicateProductAction}
                                className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#171717] outline-none hover:bg-[#f6f1e8]"
                              >
                                Duplicate
                              </button>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                              <button
                                type="submit"
                                formAction={deleteProductAction}
                                className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#8a3b35] outline-none hover:bg-[#fdf2f1]"
                              >
                                Delete
                              </button>
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  </form>
                ))
              ) : (
                <div className="px-4 py-12 text-center text-sm text-[#6f6558]">
                  No products match the current search and filters.
                </div>
              )}
            </div>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
