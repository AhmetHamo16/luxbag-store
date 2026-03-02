import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { paymentService } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

const StripePayment = ({ 
  items, 
  shippingCost, 
  discountAmount, 
  shippingAddress, 
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // 1. Create PaymentIntent on the backend
      const { clientSecret } = await paymentService.createPaymentIntent({
        items,
        shippingCost,
        discountAmount,
      });

      // 2. Confirm the payment with Stripe.js
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: shippingAddress.email,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              country: shippingAddress.country || 'TR',
            }
          }
        }
      });

      if (payload.error) {
        setError(`Payment failed: ${payload.error.message}`);
        setProcessing(false);
      } else {
        // Payment succeeded
        setError(null);
        setProcessing(false);
        // Invoke success callback handling order creation
        if (onSuccess) await onSuccess(payload.paymentIntent);
        
        navigate('/order-success', { state: { paymentIntent: payload.paymentIntent } });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1E1E1E',
        fontFamily: 'Inter, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full">
      <div className="mb-6 p-4 border border-gray-300 rounded bg-white">
        <CardElement id="card-element" options={cardElementOptions} />
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-sm font-medium p-3 bg-red-50 rounded">
          {error}
        </div>
      )}

      <button
        disabled={processing || !stripe}
        type="submit"
        className="w-full bg-black text-white py-4 font-medium uppercase tracking-widest hover:bg-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Pay & Place Order'}
      </button>
    </form>
  );
};

export default StripePayment;
