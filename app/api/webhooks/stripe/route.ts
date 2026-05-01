// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { OrderService } from "@/services/order.service";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig     = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = constructWebhookEvent(payload, sig);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const orderId = session.metadata?.orderId;
        if (!orderId) break;

        await prisma.$transaction([
          prisma.payment.updateMany({
            where: { orderId },
            data:  {
              status:                   "COMPLETED",
              stripePaymentIntentId:    session.payment_intent,
              paidAt:                   new Date(),
            },
          }),
          prisma.order.update({
            where: { id: orderId },
            data:  { status: "PAID" },
          }),
        ]);

        // Decrease stock
        const items = await prisma.orderItem.findMany({ where: { orderId } });
        await Promise.all(
          items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data:  { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
            })
          )
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const pi    = event.data.object as any;
        const order = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: pi.id },
        });
        if (order) {
          await prisma.payment.update({
            where: { id: order.id },
            data:  { status: "FAILED", failureMessage: pi.last_payment_error?.message },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: charge.payment_intent },
        });
        if (payment) {
          await prisma.$transaction([
            prisma.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } }),
            prisma.order.update({ where: { id: payment.orderId }, data: { status: "REFUNDED" } }),
          ]);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
