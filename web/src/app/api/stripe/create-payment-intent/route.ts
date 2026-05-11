import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const REGISTRATION_FEE_CENTS = 5000;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null;

export async function POST() {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is missing." },
      { status: 500 },
    );
  }

  try {
    const amount = REGISTRATION_FEE_CENTS;
    const currency = "usd";

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create payment intent." },
      { status: 500 },
    );
  }
}
