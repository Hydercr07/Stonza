"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartLineInput, Product } from "@/types/domain";

const STORAGE_KEY = "stonza-cart";

type CartContextValue = {
  lines: CartLineInput[];
  count: number;
  addItem: (
    input: CartLineInput,
    product: Pick<Product, "inventoryQuantity" | "oneOfOne" | "sizes" | "variantLabel" | "variants" | "name">,
  ) => { ok: boolean; message?: string };
  removeItem: (productId: string, selectedSize?: string, selectedVariant?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    maxAvailable: number,
    selectedSize?: string,
    selectedVariant?: string,
  ) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartLineInput, b: Pick<CartLineInput, "productId" | "selectedSize" | "selectedVariant">) {
  return (
    a.productId === b.productId &&
    (a.selectedSize ?? "") === (b.selectedSize ?? "") &&
    (a.selectedVariant ?? "") === (b.selectedVariant ?? "")
  );
}

function getReservedQuantity(
  lines: CartLineInput[],
  productId: string,
  exclude?: Pick<CartLineInput, "productId" | "selectedSize" | "selectedVariant">,
) {
  return lines.reduce((total, line) => {
    if (line.productId !== productId) return total;
    if (exclude && sameLine(line, exclude)) return total;
    return total + line.quantity;
  }, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Always start empty so the very first render matches the server exactly
  // (SSR has no access to localStorage) -- reading it inside a useState
  // initializer instead makes the client's first render diverge from the
  // server-rendered HTML, which React then has to discard and redo. The
  // cart is hydrated from localStorage a moment after mount instead, below.
  const [lines, setLines] = useState<CartLineInput[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CartLineInput[];
      if (Array.isArray(parsed) && parsed.length) {
        // One-time sync from an external system (localStorage) into React
        // state right after mount -- exactly the case the underlying rule's
        // own guidance calls out as acceptable, not a per-render cascade.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLines(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    // Skip the first run (the initial empty-cart render, before the load
    // effect above has had a chance to run) so it can't stomp a real saved
    // cart with `[]` before it's even been read.
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((total, line) => total + line.quantity, 0),
      addItem(input, product) {
        if (product.sizes?.length && !input.selectedSize) {
          return { ok: false, message: `Select a size for ${product.name} before adding it to the cart.` };
        }

        if (product.variants?.length && !input.selectedVariant) {
          return {
            ok: false,
            message: `Select a ${product.variantLabel?.toLowerCase() || "variant"} for ${product.name} before adding it to the cart.`,
          };
        }

        if (input.quantity < 1) {
          return { ok: false, message: "Choose a valid quantity." };
        }

        if (product.oneOfOne && input.quantity > 1) {
          return { ok: false, message: `${product.name} is a one-of-one piece and can only be added once.` };
        }

        const existing = lines.find((line) => sameLine(line, input));
        const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
        const reservedElsewhere = getReservedQuantity(lines, input.productId, input);
        if (reservedElsewhere + nextQuantity > product.inventoryQuantity) {
          return { ok: false, message: `Only ${product.inventoryQuantity} unit(s) of ${product.name} are available.` };
        }

        setLines((current) => {
          const index = current.findIndex((line) => sameLine(line, input));
          if (index === -1) {
            return [...current, input];
          }
          return current.map((line, currentIndex) =>
            currentIndex === index ? { ...line, quantity: nextQuantity } : line,
          );
        });

        return { ok: true };
      },
      removeItem(productId, selectedSize, selectedVariant) {
        setLines((current) =>
          current.filter((line) => !sameLine(line, { productId, selectedSize, selectedVariant })),
        );
      },
      updateQuantity(productId, quantity, maxAvailable, selectedSize, selectedVariant) {
        setLines((current) =>
          current
            .map((line) => {
              if (!sameLine(line, { productId, selectedSize, selectedVariant })) {
                return line;
              }

              const reservedElsewhere = getReservedQuantity(current, productId, {
                productId,
                selectedSize,
                selectedVariant,
              });
              const nextMax = Math.max(0, maxAvailable - reservedElsewhere);
              const nextQuantity = Math.min(Math.max(1, quantity), nextMax);
              return { ...line, quantity: nextQuantity };
            })
            .filter((line) => line.quantity > 0),
        );
      },
      clear() {
        // Bail out with the same array reference when already empty so a
        // caller that re-invokes clear() on every render (e.g. an effect
        // keyed on this function's identity) can't loop forever: setting a
        // brand-new `[]` every time would otherwise "change" state by
        // reference even though the content never does.
        setLines((current) => (current.length === 0 ? current : []));
      },
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return context;
}
