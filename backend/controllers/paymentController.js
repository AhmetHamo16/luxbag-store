const stripe = require('../config/stripe');
const Order = require('../models/Order');

// @desc    Create Payment Intent
// @route   POST /api/payment/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, shippingCost, discountAmount } = req.body;

    // In a real app, calculate total securely from DB prices here
    // For now, assume client sends calculated subtotal properly or calculate from items manually
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost - discountAmount;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects cents
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString()
      }
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/payment/webhook
// @access  Public
exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be raw string here
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Since order is usually created before or immediately after payment locally,
      // here we just find order by payment intent ID and update status.
      // Alternatively, we can rely on metadata sent during order creation.
      const order = await Order.findOne({ 'payment.stripePaymentId': paymentIntent.id });
      if (order) {
        order.payment.status = 'paid';
        order.status = 'processing';
        await order.save();
        
        // Trigger Email (handled via event emitter or direct call if refactored)
      }
      break;
    
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

// @desc    Refund Payment
// @route   POST /api/payment/refund
// @access  Private/Admin
exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.payment.stripePaymentId) return res.status(400).json({ success: false, message: 'No Stripe payment ID found' });

    const refund = await stripe.refunds.create({
      payment_intent: order.payment.stripePaymentId,
    });

    order.payment.status = 'refunded';
    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, data: refund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
