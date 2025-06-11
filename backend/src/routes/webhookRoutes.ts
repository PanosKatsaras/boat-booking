import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe outside the router.post for consistency
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', 
});

// Middleware before app.use(express.json())
// A dedicated router for webhooks with raw body parser.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event: Stripe.Event;

  // Retrieve the webhook secret from environment variables
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set!');
    return res.status(500).send('Webhook secret not configured.');
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, signature!, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId; // Get bookingId from metadata

      if (bookingId) {
        try {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { paid: true },
          });
          console.log(`Booking ${bookingId} marked as paid successfully.`);
        } catch (updateError) {
          console.error(`Error updating booking ${bookingId} to paid:`, updateError);
        }
      } else {
        console.warn('checkout.session.completed event received without bookingId in metadata.');
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Response to acknowledge receipt of the event
  res.json({ received: true });
});


export default router;