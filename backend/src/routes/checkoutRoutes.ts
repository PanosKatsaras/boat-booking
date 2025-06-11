import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe with secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Endpoint to create a new Stripe checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    // Destructure booking details from request body
    const {
      boatId,
      portId,
      userId,
      startTime,
      endTime,
      includeCaptain,
      bookingType,
      durationHours,
    } = req.body;

    // Basic validation to ensure all required fields are provided
    if (!boatId || !portId || !userId || !startTime || !endTime || !bookingType) {
      return res.status(400).json({ error: 'Missing required booking data' });
    }

    // Retrieve boat details from the database
    const boat = await prisma.boat.findUnique({ where: { id: boatId } });
    if (!boat) return res.status(404).json({ error: 'Boat not found' });

    // Calculate base price based on booking type
    let price = 0;
    if (bookingType === 'per_hour') {
      price = boat.hourlyRate * durationHours;
    } else if (bookingType === 'half_day') {
      price = boat.halfDayRate;
    } else if (bookingType === 'full_day') {
      price = boat.fullDayRate;
    }

    // Add captain fee if selected
    if (includeCaptain) {
      if (bookingType === 'per_hour') price += 100;
      else if (bookingType === 'half_day') price += 200;
      else if (bookingType === 'full_day') price += 400;
    }

    // Create a new booking record in the database (unpaid at this stage)
    const booking = await prisma.booking.create({
      data: {
        boatId,
        portId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        includeCaptain,
        price,
        paid: false,
      },
    });

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${process.env.CLIENT_URL}/success?bookingId=${booking.id}`, // Redirect on success
      cancel_url: `${process.env.CLIENT_URL}/cancel`, // Redirect on cancel
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(price * 100), // Stripe requires amount in cents
            product_data: {
              name: boat.name,
              description: `${bookingType} booking from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}`,
            },
          },
          quantity: 1, 
        },
      ],
      metadata: {
        bookingId: booking.id,
        userId: userId,
        boatId: boatId,
        portId: portId,
      },
    });

    // Send session URL and ID back to client
    res.json({ url: session.url, id: session.id });

  } catch (error) {
    // Log and return generic server error
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Internal server error during checkout process' });
  }
});

export default router;
