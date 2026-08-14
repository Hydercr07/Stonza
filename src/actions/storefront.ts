"use server";

import { redirect } from "next/navigation";
import { createOrder } from "@/lib/data/store";
import { checkoutSchema } from "@/lib/validation/admin";

export type CheckoutActionState = {
  error: string | null;
};

export async function placeOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  try {
    const cartJson = String(formData.get("cartLines") ?? "[]");
    const payload = checkoutSchema.parse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      city: formData.get("city"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2") || undefined,
      postalCode: formData.get("postalCode") || undefined,
      orderNotes: formData.get("orderNotes") || undefined,
      paymentMethod: formData.get("paymentMethod"),
      submissionToken: formData.get("submissionToken") || undefined,
      cartLines: JSON.parse(cartJson),
    });

    const order = await createOrder({
      customer: {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        city: payload.city,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        postalCode: payload.postalCode,
        orderNotes: payload.orderNotes,
      },
      paymentMethod: payload.paymentMethod,
      cartLines: payload.cartLines,
      submissionToken: payload.submissionToken,
    });

    redirect(`/order-confirmation/${order.orderNumber}`);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Your order could not be placed.";
    return { error: message };
  }
}
