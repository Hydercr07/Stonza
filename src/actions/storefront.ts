"use server";

import { redirect } from "next/navigation";
import { createOrder } from "@/lib/data/store";
import { checkoutSchema } from "@/lib/validation/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendOrderConfirmationEmail, sendOrderNotificationToOwner } from "@/lib/email";

export type CheckoutActionState = {
  error: string | null;
};

export async function placeOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  try {
    const ip = await getClientIp();
    const limit = checkRateLimit(`checkout:${ip}`, 8, 60 * 60 * 1000);
    if (!limit.allowed) {
      return { error: `Too many orders submitted recently. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s), or contact us on WhatsApp.` };
    }

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

    // Best-effort: a customer's order is placed and paid for the moment
    // createOrder() above returns, so a flaky email provider must never
    // turn into a failed checkout -- log and move on instead of throwing.
    try {
      await Promise.all([sendOrderConfirmationEmail(order), sendOrderNotificationToOwner(order)]);
    } catch (emailError) {
      console.error("Order email notification failed:", emailError);
    }

    const tokenParam = order.submissionToken ? `?token=${encodeURIComponent(order.submissionToken)}` : "";
    redirect(`/order-confirmation/${order.orderNumber}${tokenParam}`);
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
