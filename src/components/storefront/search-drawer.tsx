"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, Search, X } from "lucide-react";
import type { Product } from "@/types/domain";
import { formatMoney, getProductDisplayPrice, isRemoteAsset } from "@/lib/utils";

export function SearchDrawer({
  open,
  onOpenChange,
  products,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) return [];

    return products
      .filter((product) =>
        [
          product.name,
          product.sku,
          product.origin,
          product.stoneType,
          product.collectionSlug,
          product.categorySlug,
          ...(product.tags ?? []),
          ...(product.searchKeywords ?? []),
          ...(product.variants ?? []).map((variant) => variant.value),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 8);
  }, [deferredQuery, products]);

  const loading = query.trim().length > 0 && deferredQuery !== query;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/52 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-[#faf8f3] shadow-[0_18px_60px_rgba(12,16,22,0.16)]">
          <div className="container-shell py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-black/58">
                <Search className="h-4 w-4" />
              </div>
              <form
                className="flex-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  const normalized = query.trim();
                  onOpenChange(false);
                  router.push(normalized ? `/shop?q=${encodeURIComponent(normalized)}` : "/shop");
                }}
              >
                <label className="sr-only" htmlFor="global-search">
                  Search products
                </label>
                <input
                  id="global-search"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, SKU, tag or collection"
                  className="h-12 w-full rounded-full border border-black/10 bg-white px-5 text-sm text-black outline-none placeholder:text-black/32 focus:border-black/22"
                />
              </form>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-black/58"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-white p-4 sm:p-5">
              {!query.trim() ? (
                <div className="flex min-h-40 items-center justify-center text-center text-sm text-black/48">
                  Start typing to preview products before opening the full search results.
                </div>
              ) : loading ? (
                <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-black/52">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Searching the catalogue
                </div>
              ) : results.length ? (
                <div className="grid gap-3">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/stones/${product.slug}`}
                      className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-[1.2rem] border border-black/6 p-3 transition hover:border-black/16 hover:bg-[#faf7f1]"
                      onClick={() => onOpenChange(false)}
                    >
                      <div className="relative h-[4.5rem] overflow-hidden rounded-[0.9rem] bg-[#f1ede6]">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage}
                            alt={product.altText}
                            fill
                            className="object-cover"
                            sizes="72px"
                            unoptimized={isRemoteAsset(product.featuredImage)}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold uppercase tracking-[0.12em] text-black/82">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-black/42">
                          {product.collectionSlug || product.categorySlug || product.sku}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-black/72">
                          {product.salePrice ? (
                            <span className="text-black/28 line-through">{formatMoney(product.price, product.currency)}</span>
                          ) : null}
                          <span className="font-semibold text-black">{formatMoney(getProductDisplayPrice(product), product.currency)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-black/52">No results</p>
                  <p className="mt-2 max-w-md text-sm text-black/44">
                    We could not find a matching product. Press Enter to see broader results on the shop page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
