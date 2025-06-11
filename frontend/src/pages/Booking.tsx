import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem, FormControl,
  InputLabel, Checkbox, FormControlLabel, Button, Box, Paper
} from '@mui/material';
// Date picker from MUI and adapter
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// Stripe for payment
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
// Authentication context
import { useAuth } from '../context/AuthContext';
// English locale for date picker
import { enUS } from 'date-fns/locale';

// Load Stripe with the publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

// Boat type definition
interface Boat {
  id: string;
  name: string;
  type: string; // BoatType enum
  imageUrl?: string;
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  port: {
    id: string;
    name: string;
  };
}

export default function Booking() {
  // State variables
  const [boats, setBoats] = useState<Boat[]>([]);
  const [selectedBoatId, setSelectedBoatId] = useState('');
  const [boat, setBoat] = useState<Boat | null>(null);
  const { user } = useAuth(); // Authenticated user

  const [bookingType, setBookingType] = useState('full_day');
  const [durationHours, setDurationHours] = useState(12);
  const [withCaptain, setWithCaptain] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [price, setPrice] = useState(0);

  // Fetch boats from backend API
  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const res = await axios.get<Boat[]>(`${process.env.REACT_APP_SERVER_URL}/api/boats`);
        setBoats(res.data);

        // Select the first boat by default
        if (res.data.length > 0) {
          setSelectedBoatId(res.data[0].id);
          setBoat(res.data[0]);
        } else {
          console.warn('No boats found in the API response.');
        }
      } catch (err) {
        console.error('Failed to fetch boats:', err);
        if (axios.isAxiosError(err) && err.response) {
          alert(`Error fetching boats: ${err.response.data.message || 'Unknown error'}`);
        } else {
          alert('An unexpected error occurred while fetching boats.');
        }
      }
    };

    fetchBoats();
  }, []);

  // Recalculate price whenever boat or options change
  useEffect(() => {
    if (!boat) {
      setPrice(0);
      return;
    }

    let total = 0;

    // Calculate price based on booking type
    if (bookingType === 'per_hour') {
      total = boat.hourlyRate * durationHours;
      if (withCaptain) total += 100;
    } else if (bookingType === 'half_day') {
      total = boat.halfDayRate;
      if (withCaptain) total += 200;
    } else {
      total = boat.fullDayRate;
      if (withCaptain) total += 400;
    }

    setPrice(total);
  }, [boat, bookingType, durationHours, withCaptain]);

  // Adjust duration automatically based on booking type
  useEffect(() => {
    if (bookingType === 'half_day') setDurationHours(6);
    else if (bookingType === 'full_day') setDurationHours(12);
    else setDurationHours(1);
  }, [bookingType]);

  // Handle Stripe Checkout
  const handleCheckout = async () => {
    if (!boat || !selectedDate) {
      alert('Please select a boat and a date.');
      return;
    }

    // Build start and end time for the booking
    const start = new Date(`${selectedDate.toISOString().split('T')[0]}T${startTime}:00`);
    const end = new Date(start);
    end.setHours(start.getHours() + durationHours);

    // Ensure user is logged in
    if (!user) {
      alert('You must be logged in to book a boat.');
      return;
    }

    try {
      // Send booking details to backend
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/checkout/create-checkout-session`, {
        boatId: boat.id,
        portId: boat.port.id,
        userId: user.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        includeCaptain: withCaptain,
        bookingType,
        durationHours,
      }, {
        withCredentials: true
      });

      const data = res.data;

      // Redirect to Stripe checkout
      if (data.url && data.id) {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.id });
        } else {
          alert('Error with payment gateway. Please try again.');
        }
      } else {
        alert(data.error || 'Error creating checkout session.');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Error during checkout: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
      } else {
        alert('An unexpected error occurred during checkout.');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>Book a Boat</Typography>

      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>

          {/* Date picker */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              disablePast
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          {/* Boat selection */}
          <FormControl fullWidth>
            <InputLabel>Select Boat</InputLabel>
            <Select
              value={selectedBoatId}
              onChange={(e) => {
                const selected = boats.find((b) => b.id === e.target.value);
                setSelectedBoatId(e.target.value);
                setBoat(selected ?? null);
              }}
              disabled={boats.length === 0}
            >
              {boats.length > 0 ? (
                boats.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} ({b.type}) {b.port ? ` - ${b.port.name}` : ''}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  Loading boats... or No boats available.
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Booking type selection */}
          <FormControl fullWidth>
            <InputLabel>Booking Type</InputLabel>
            <Select value={bookingType} onChange={(e) => setBookingType(e.target.value)}>
              <MenuItem value="per_hour">Per Hour</MenuItem>
              <MenuItem value="half_day">Half Day</MenuItem>
              <MenuItem value="full_day">Full Day</MenuItem>
            </Select>
          </FormControl>

          {/* Duration input for per-hour bookings */}
          {bookingType === 'per_hour' && (
            <TextField
              label="Duration (hours)"
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              inputProps={{ min: 1, max: 12 }}
              fullWidth
            />
          )}

          {/* Start time input */}
          <TextField
            label="Start Time (HH:mm)"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
          />

          {/* Captain option */}
          <FormControlLabel
            control={
              <Checkbox
                checked={withCaptain}
                onChange={(e) => setWithCaptain(e.target.checked)}
              />
            }
            label="Include Captain"
          />

          {/* Price display */}
          <Typography variant="h6">Total Price: €{price}</Typography>

          {/* Checkout button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            disabled={!boat}
            sx={{ color: 'white' }}
          >
            Confirm & Pay
          </Button>

          {/* Navigation button */}
          <Button href="/" variant="outlined" color="secondary">
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
