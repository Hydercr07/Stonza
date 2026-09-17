import "server-only";

import { Resend } from "resend";
import type { OrderRecord } from "@/types/domain";
import { formatMoney } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/**
 * Order confirmation email. Deliberately opt-in behind RESEND_API_KEY (same
 * pattern as DATA_BACKEND for the database migration) so shipping this code
 * never breaks checkout for a deployment that hasn't set up an email
 * provider yet -- sendOrderConfirmationEmail() below is a silent no-op
 * without it, and any failure here is caught by the caller and logged, never
 * allowed to fail the order itself.
 */
export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function renderOrderConfirmationEmail(order: OrderRecord): { subject: string; html: string; text: string } {
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eadfcf;">
            <div style="font-family:Georgia,serif;font-size:15px;color:#171717;">${item.productName}</div>
            <div style="font-size:13px;color:#6f6558;margin-top:2px;">
              Qty ${item.quantity}${item.selectedSize ? ` &middot; Size ${item.selectedSize}` : ""}${item.selectedVariant ? ` &middot; ${item.selectedVariant}` : ""}
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eadfcf;text-align:right;font-size:14px;color:#171717;white-space:nowrap;">
            ${formatMoney(item.unitPrice * item.quantity, order.currency)}
          </td>
        </tr>`,
    )
    .join("");

  const textLines = order.items.map(
    (item) => `- ${item.productName} x${item.quantity}: ${formatMoney(item.unitPrice * item.quantity, order.currency)}`,
  );

  const html = `
    <div style="background:#f6f2ea;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#fffdf9;border:1px solid #eadfcf;border-radius:16px;overflow:hidden;">
        <div style="background:#171717;padding:28px 32px;">
          <div style="font-family:Georgia,serif;font-size:22px;letter-spacing:0.08em;color:#fffdf9;">${siteConfig.name}</div>
        </div>
        <div style="padding:32px;">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#a2845d;margin:0 0 8px;">Order confirmed</p>
          <h1 style="font-family:Georgia,serif;font-size:24px;color:#171717;margin:0 0 8px;">Thank you, ${order.customer.fullName.split(" ")[0]}.</h1>
          <p style="font-size:14px;color:#6f6558;margin:0 0 24px;">
            Order <strong style="color:#171717;">${order.orderNumber}</strong> has been received and is being prepared.
          </p>
          <table style="width:100%;border-collapse:collapse;">
            ${itemRows}
            <tr>
              <td style="padding:16px 0 4px;font-size:14px;color:#6f6558;">Subtotal</td>
              <td style="padding:16px 0 4px;text-align:right;font-size:14px;color:#171717;">${formatMoney(order.subtotal, order.currency)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#6f6558;">Shipping</td>
              <td style="padding:4px 0;text-align:right;font-size:14px;color:#171717;">${order.shipping > 0 ? formatMoney(order.shipping, order.currency) : "Free"}</td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;font-size:15px;font-weight:bold;color:#171717;border-top:1px solid #eadfcf;">Total</td>
              <td style="padding:12px 0 0;text-align:right;font-size:15px;font-weight:bold;color:#171717;border-top:1px solid #eadfcf;">${formatMoney(order.total, order.currency)}</td>
            </tr>
          </table>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #eadfcf;">
            <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#a2845d;margin:0 0 8px;">Delivery address</p>
            <p style="font-size:14px;color:#171717;line-height:1.6;margin:0;">
              ${order.customer.fullName}<br />
              ${order.customer.addressLine1}${order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}<br />
              ${order.customer.city}, ${order.customer.country}${order.customer.postalCode ? ` ${order.customer.postalCode}` : ""}<br />
              ${order.customer.phone}
            </p>
          </div>
          <p style="margin-top:28px;font-size:13px;color:#6f6558;">
            Payment method: ${order.paymentMethod}. We'll be in touch with shipping updates.
          </p>
        </div>
      </div>
    </div>`;

  const text = [
    `Thank you, ${order.customer.fullName.split(" ")[0]}.`,
    `Order ${order.orderNumber} has been received and is being prepared.`,
    "",
    ...textLines,
    "",
    `Subtotal: ${formatMoney(order.subtotal, order.currency)}`,
    `Shipping: ${order.shipping > 0 ? formatMoney(order.shipping, order.currency) : "Free"}`,
    `Total: ${formatMoney(order.total, order.currency)}`,
    "",
    `Delivery address: ${order.customer.fullName}, ${order.customer.addressLine1}${order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}, ${order.customer.city}, ${order.customer.country}${order.customer.postalCode ? ` ${order.customer.postalCode}` : ""}`,
    `Payment method: ${order.paymentMethod}`,
  ].join("\n");

  return { subject: `Order confirmed — ${order.orderNumber}`, html, text };
}

export async function sendOrderConfirmationEmail(order: OrderRecord) {
  if (!isEmailConfigured()) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.ORDER_EMAIL_FROM || `${siteConfig.name} <orders@${new URL(siteConfig.siteUrl).hostname}>`;
  const { subject, html, text } = renderOrderConfirmationEmail(order);

  const { error } = await resend.emails.send({
    from,
    to: order.customer.email,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Order confirmation email failed to send: ${error.message}`);
  }
}

/** Lets the owner know a new order came in, separate from the customer's own receipt. */
export async function sendOrderNotificationToOwner(order: OrderRecord) {
  if (!isEmailConfigured() || !process.env.OWNER_EMAIL) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.ORDER_EMAIL_FROM || `${siteConfig.name} <orders@${new URL(siteConfig.siteUrl).hostname}>`;
  const itemSummary = order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ");

  const { error } = await resend.emails.send({
    from,
    to: process.env.OWNER_EMAIL,
    subject: `New order ${order.orderNumber} — ${formatMoney(order.total, order.currency)}`,
    text: [
      `New order from ${order.customer.fullName} (${order.customer.email}, ${order.customer.phone}).`,
      `Items: ${itemSummary}`,
      `Total: ${formatMoney(order.total, order.currency)}`,
      `Payment: ${order.paymentMethod}`,
      `Address: ${order.customer.addressLine1}, ${order.customer.city}, ${order.customer.country}`,
    ].join("\n"),
  });

  if (error) {
    throw new Error(`Order notification email failed to send: ${error.message}`);
  }
}
