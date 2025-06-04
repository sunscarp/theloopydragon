import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay (you'll need to add your keys)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_SECRET || 'YOUR_SECRET',
});

export async function POST(req: Request) {
  const body = await req.json();
  const { amount } = body;

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    return NextResponse.json(
      { error: 'Error creating payment order' },
      { status: 500 }
    );
  }
}
