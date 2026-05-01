// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { checkoutSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page    = parseInt(searchParams.get("page")    ?? "1");
    const perPage = parseInt(searchParams.get("perPage") ?? "10");

    const result = await OrderService.findByUser(session.user.id, page, perPage);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { addressId, address, couponCode, notes, saveAddress } = checkoutSchema.parse(body);

    // Save address if requested
    let finalAddressId = addressId;
    if (!addressId && address) {
      const saved = await prisma.address.create({
        data: { ...address, userId: session.user.id },
      });
      finalAddressId = saved.id;
    }

    // Create order
    const order = await OrderService.createFromCart({
      userId:     session.user.id,
      addressId:  finalAddressId,
      couponCode,
      notes,
    });

    // Create Stripe checkout session
    const orderWithItems = await prisma.order.findUnique({
      where:   { id: order.id },
      include: { items: true },
    });

    const stripeSession = await createCheckoutSession({
      lineItems: orderWithItems!.items.map((item) => ({
        price_data: {
          currency:     "thb",
          product_data: { name: item.productName, images: item.productImage ? [item.productImage] : [] },
          unit_amount:  Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      })),
      orderId:    order.id,
      userId:     session.user.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=1`,
      cancelUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=1`,
    });

    // Update payment with stripe session id
    await prisma.payment.update({
      where: { orderId: order.id },
      data:  { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ success: true, data: { orderId: order.id, checkoutUrl: stripeSession.url } }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
