import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findUserById } from "@/lib/models/User";
import { createOrder, type OrderItemDoc } from "@/lib/models/Order";
import { findProductById } from "@/lib/models/Product";
import { Resend } from "resend";

interface OrderInputItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  slug?: string;
  imageUrl?: string;
}

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const input = (Array.isArray(body?.items) ? body.items : []) as OrderInputItem[];
    if (input.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Attach the real product file url to each item so buyers can download later.
    const items: OrderItemDoc[] = [];
    for (const i of input) {
      let fileUrl: string | undefined;
      let name = i.name;
      let slug = i.slug;
      if (i.productId) {
        const product = await findProductById(i.productId);
        fileUrl = product?.fileUrl;
        name = product?.name || name;
        slug = product?.slug || slug;
      }
      items.push({
        productId: i.productId || "",
        name,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        imageUrl: i.imageUrl,
        fileUrl,
      });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const buyerInfo = await findUserById(auth.userId);
    const buyer = buyerInfo?.name || "";
    const email = buyerInfo?.email || "";

    // Save the order in the database.
    const orderResult = await createOrder({
      userId: auth.userId,
      userName: buyer,
      userEmail: email,
      items,
      total,
      status: "pending",
    });
    const orderId = orderResult.insertedId.toString();

    const lines = items
      .map((i, idx) => `${idx + 1}. ${i.name} — Qty ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");

    try {
      const resend = getResend();
      const to = process.env.ORDER_EMAIL || "";
      if (resend && to) {
        const msg: Parameters<typeof resend.emails.send>[0] = {
          from: "CognitoByte <onboarding@resend.dev>",
          to,
          subject: `New order #${orderId.slice(-6)} — $${total.toFixed(2)}`,
          html: `
            <h2>New Order — CognitoByte</h2>
            <p><strong>Order:</strong> ${orderId}</p>
            <p><strong>Buyer:</strong> ${buyer || "N/A"}</p>
            <p><strong>Buyer email:</strong> ${email || "N/A"}</p>
            <h3>Items</h3>
            <pre>${lines}</pre>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          `,
        };
        if (email) msg.replyTo = email;
        const result = await resend.emails.send(msg);
        if (result?.error) {
          console.error("Order email error:", result.error);
        }
      }
    } catch (emailError) {
      console.error("Order email error:", emailError);
    }

    return NextResponse.json({ success: true, total, orderId });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}