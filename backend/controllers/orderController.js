const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const order = new Order({ ...req.body, user: req.user._id });
    const createdOrder = await order.save();
    
    const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'name email');
    
    await sendEmail({
      to: populatedOrder.user.email,
      subject: 'Order Confirmation - Melora',
      type: 'orderConfirmation',
      data: { name: populatedOrder.user.name, orderId: populatedOrder._id, total: populatedOrder.total }
    });

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'id name email').sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (req.body.status) order.status = req.body.status;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    
    await order.save();
    
    if (req.body.status === 'shipped') {
      await sendEmail({
        to: order.user.email,
        subject: 'Your Melora Order Has Shipped',
        type: 'shippingUpdate',
        data: { orderId: order._id, trackingNumber: order.trackingNumber || 'Pending Tracking ID' }
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Check ownership if not admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'User not authorized to update this order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an order that is already processing or shipped' });
    }

    order.status = 'cancelled';
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
