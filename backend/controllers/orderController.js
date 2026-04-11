const Order = require('../models/Order');
const Product = require('../models/Product');
const Setting = require('../models/Setting');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const CashierShift = require('../models/CashierShift');
const Analytics = require('../models/Analytics');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

const normalizeItemName = (name) => {
  if (!name) return 'Melora Product';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') return name.en || name.ar || name.tr || Object.values(name)[0] || 'Melora Product';
  return String(name);
};

const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol || 'https')
    .toString()
    .split(',')[0]
    .trim();
  return `${protocol}://${req.get('host')}`;
};

const getUploadedReceiptUrl = (file, req) => {
  if (!file) return null;
  if (file.path && /^https?:\/\//i.test(file.path)) {
    return file.path;
  }

  const baseUrl = getRequestBaseUrl(req);

  if (file.filename) {
    return `${baseUrl}/uploads/receipts/${file.filename}`;
  }

  if (file.path) {
    const normalized = file.path.replace(/\\/g, '/');
    const marker = '/uploads/';
    const markerIndex = normalized.lastIndexOf(marker);
    if (markerIndex >= 0) {
      return `${baseUrl}${normalized.slice(markerIndex)}`;
    }
  }

  return null;
};

const calculateCouponDiscount = (coupon, subtotal, shippingCost = 0) => {
  if (!coupon) return 0;

  if (coupon.discountType === 'percentage') {
    return Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
  }

  if (coupon.discountType === 'fixed') {
    return Math.min(Number(coupon.discountValue || 0), Number(subtotal || 0));
  }

  if (coupon.discountType === 'free_shipping') {
    return Number(shippingCost || 0);
  }

  return 0;
};

const notifyAdminForBankTransfer = async (order) => {
  if (order.payment?.method !== 'iban') return;

  try {
    const [settings, adminUser] = await Promise.all([
      Setting.findOne().lean(),
      User.findOne({ role: 'admin', isActive: true }).lean()
    ]);

    const adminEmail = settings?.storeEmail || adminUser?.email;
    if (!adminEmail) return;

    await sendEmail({
      to: adminEmail,
      subject: `New IBAN order received: ${order._id}`,
      type: 'adminBankTransferAlert',
      data: {
        orderId: order._id,
        total: order.total,
        customerName: order.shippingAddress?.fullName || 'Guest customer',
        customerEmail: order.shippingAddress?.email || '',
        customerPhone: order.shippingAddress?.phone || '',
        receiptImage: order.payment?.receiptImage || ''
      }
    });
  } catch (error) {
    console.error('Admin notification failed:', error.message);
  }
};

const decrementOrderStock = async (items) => {
  for (const item of items) {
    if (item.variant) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': -item.quantity, 'stockControl.totalStock': -item.quantity } }
      );
    } else {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity } }
      );
    }
  }
};

const restoreOrderStock = async (items) => {
  for (const item of items) {
    if (item.variant) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': Number(item.quantity || 0), 'stockControl.totalStock': Number(item.quantity || 0) } }
      );
    } else {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: Number(item.quantity || 0) } }
      );
    }
  }
};

const calculatePosMetrics = (orders = []) => {
  const metrics = {
    totalSales: 0,
    expectedCash: 0,
    expectedCard: 0,
    invoicesCount: orders.length,
    piecesCount: 0,
    discountTotal: 0,
    estimatedProfit: 0
  };

  for (const order of orders) {
      const total = Number(order.total || 0);
      const discount = Number(order.discountAmount || 0);
      const method = String(order.payment?.method || '').toLowerCase();
      const cashAmount = Number(order.payment?.cashAmount || 0);
      const cardAmount = Number(order.payment?.cardAmount || 0);

    metrics.totalSales += total;
    metrics.discountTotal += discount;
    metrics.piecesCount += (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const orderCost = (order.items || []).reduce(
      (costSum, item) => costSum + (Number(item.costPrice || 0) * Number(item.quantity || 0)),
      0
    );
    metrics.estimatedProfit += total - orderCost;

      if (method === 'cash') {
        metrics.expectedCash += cashAmount || total;
      } else if (method === 'card') {
        metrics.expectedCard += cardAmount || total;
      } else if (method === 'mixed') {
        metrics.expectedCash += cashAmount;
        metrics.expectedCard += cardAmount;
      }
    }

  return metrics;
};

const buildShiftSummary = async (cashierId, openedAt, closedAt = new Date()) => {
  const orders = await Order.find({
    salesChannel: 'pos',
    createdBy: cashierId,
    createdAt: { $gte: openedAt, $lte: closedAt }
  }).lean();

  return calculatePosMetrics(orders);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    let orderData;
    if (req.body.orderData) {
      try {
        orderData = JSON.parse(req.body.orderData);
      } catch(parseErr) {
        console.log('JSON PARSE ERROR:', parseErr.message);
        return res.status(400).json({ message: 'Invalid order data format', error: parseErr.message });
      }
    } else {
      orderData = req.body;
    }

    const receiptImage = getUploadedReceiptUrl(req.file, req);

    if (!receiptImage && orderData?.payment?.method === 'iban') {
      return res.status(400).json({ message: 'Receipt image is required' });
    }

    if (!orderData?.shippingAddress) {
      return res.status(400).json({ message: 'Shipping address missing' });
    }

    if (!orderData?.items || orderData.items.length === 0) {
      return res.status(400).json({ message: 'Order items missing' });
    }

    const sanitizedItems = orderData.items.map(item => ({
      product: item.product,
      name: normalizeItemName(item.name),
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      image: typeof item.image === 'object' ? (item.image?.url || '/placeholder.jpg') : (item.image || '/placeholder.jpg'),
      color: item.color,
      variant: item.variant
    }));

    for (const item of sanitizedItems) {
      const productDoc = await Product.findById(item.product).lean();
      if (!productDoc) {
        return res.status(404).json({ message: 'One of the selected products was not found' });
      }

      if (item.variant) {
        const variant = productDoc.variants?.find((entry) => String(entry._id) === String(item.variant));
        if (!variant) {
          return res.status(400).json({ message: `Variant not found for ${item.name}` });
        }
        if (Number(variant.stock || 0) < Number(item.quantity || 0)) {
          return res.status(400).json({ message: `${item.name} does not have enough stock` });
        }
      } else if (Number(productDoc.stock || 0) < Number(item.quantity || 0)) {
        return res.status(400).json({ message: `${item.name} does not have enough stock` });
      }
    }

    let validatedCoupon = null;
    if (orderData?.coupon?.code) {
      validatedCoupon = await Coupon.findOne({ code: String(orderData.coupon.code).toUpperCase(), isActive: true });

      if (!validatedCoupon) {
        return res.status(400).json({ message: 'Coupon is invalid or inactive' });
      }

      if (new Date() > new Date(validatedCoupon.expiryDate)) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }

      if (validatedCoupon.usedCount >= validatedCoupon.maxUses) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }

      const subtotalValue = Number(orderData.subtotal || 0);
      const shippingCostValue = Number(orderData.shippingCost || 0);

      if (subtotalValue < Number(validatedCoupon.minPurchaseAmount || 0)) {
        return res.status(400).json({ message: `Minimum purchase amount is ${validatedCoupon.minPurchaseAmount}` });
      }

      const userUsage = validatedCoupon.redeemedBy.find((entry) => entry.user?.toString() === req.user?._id?.toString());
      if (userUsage && userUsage.count >= validatedCoupon.maxUsesPerUser) {
        return res.status(400).json({ message: `You have reached the usage limit for this coupon` });
      }

      const verifiedDiscount = calculateCouponDiscount(validatedCoupon, subtotalValue, shippingCostValue);
      orderData.discountAmount = verifiedDiscount;
      orderData.coupon.discount = verifiedDiscount;
      orderData.total = Math.max(0, subtotalValue + shippingCostValue - verifiedDiscount);
    }

    const orderPayload = {
      ...orderData,
      shippingAddress: {
        ...orderData.shippingAddress,
        fullName: orderData.shippingAddress?.fullName
          || [orderData.shippingAddress?.firstName, orderData.shippingAddress?.lastName].filter(Boolean).join(' ').trim(),
        phone: orderData.shippingAddress?.phone || '',
        email: orderData.shippingAddress?.email || ''
      },
      items: sanitizedItems,
      totalPrice: Number(orderData.totalPrice || orderData.total),
      user: req.user?._id || null,
      payment: {
        ...orderData.payment,
        status: orderData?.payment?.method === 'iban' ? 'pending_payment' : 'pending'
      },
      status: orderData?.payment?.method === 'iban' ? 'pending_payment' : 'pending'
    };
    if (receiptImage && orderPayload.payment) {
        orderPayload.payment.receiptImage = receiptImage;
    }

    const newOrder = new Order(orderPayload);
    const saved = await newOrder.save();

    if (validatedCoupon) {
      validatedCoupon.usedCount += 1;
      const existingRedemption = validatedCoupon.redeemedBy.find((entry) => entry.user?.toString() === req.user?._id?.toString());
      if (existingRedemption) {
        existingRedemption.count += 1;
      } else if (req.user?._id) {
        validatedCoupon.redeemedBy.push({ user: req.user._id, count: 1 });
      }
      await validatedCoupon.save();
    }

    setImmediate(() => {
      notifyAdminForBankTransfer(saved).catch((error) => {
        console.error('Admin notification failed:', error.message);
      });
    });
    
    // Stock Deductions (Simplified for debug phase)
    try {
      await decrementOrderStock(orderData.items);
    } catch(err) { console.error('Stock Deduction Failed', err); }

    res.status(201).json({ success: true, order: saved });

  } catch (error) {
    console.error('=== ORDER CREATION FAILED ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message,
      details: error.stack 
    });
  }
};

// @desc    Create in-store POS order
// @route   POST /api/orders/pos
// @access  Private/Admin/Cashier
exports.createPosOrder = async (req, res) => {
  try {
    const { items = [], customer = {}, payment = {}, notes = '', discountAmount = 0 } = req.body;
    const activeShift = await CashierShift.findOne({ cashier: req.user?._id, status: 'open' }).lean();

    if (!activeShift) {
      return res.status(400).json({ success: false, message: 'Open a cashier shift before recording POS sales' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one product' });
    }

      const paymentMethod = payment.method || 'cash';
      if (!['cash', 'card', 'mixed'].includes(paymentMethod)) {
        return res.status(400).json({ success: false, message: 'Unsupported POS payment method' });
      }

    const sanitizedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productDoc = await Product.findById(item.product).lean();
      if (!productDoc) {
        return res.status(404).json({ success: false, message: 'One of the selected products was not found' });
      }

      const quantity = Number(item.quantity) || 1;
      const price = Number(item.price ?? item.unitPrice ?? productDoc.salePrice ?? productDoc.price) || 0;

      if (item.variant) {
        const variant = productDoc.variants?.find((entry) => String(entry._id) === String(item.variant));
        if (!variant) {
          return res.status(400).json({ success: false, message: `Variant not found for ${normalizeItemName(item.name || productDoc.name)}` });
        }
        if (Number(variant.stock || 0) < quantity) {
          return res.status(400).json({ success: false, message: `${normalizeItemName(item.name || productDoc.name)} does not have enough stock` });
        }
      } else if (Number(productDoc.stock || 0) < quantity) {
        return res.status(400).json({ success: false, message: `${normalizeItemName(item.name || productDoc.name)} does not have enough stock` });
      }

      subtotal += price * quantity;
      sanitizedItems.push({
        product: productDoc._id,
        name: normalizeItemName(item.name || productDoc.name),
        image: typeof item.image === 'object' ? (item.image?.url || '/placeholder.jpg') : (item.image || productDoc.images?.[0]?.url || productDoc.images?.[0] || '/placeholder.jpg'),
        price,
        costPrice: Number(productDoc.costPrice || 0),
        quantity,
        color: item.color,
        size: item.size,
        variant: item.variant || null
      });
    }

    const parsedDiscount = Math.max(0, Number(discountAmount || 0));
    if (parsedDiscount > subtotal) {
      return res.status(400).json({ success: false, message: 'Discount cannot be greater than subtotal' });
    }

      const fullName = customer.fullName?.trim() || 'Walk-in Customer';
      const total = Math.max(0, subtotal - parsedDiscount);
      let cashAmount = 0;
      let cardAmount = 0;

      if (paymentMethod === 'cash') {
        cashAmount = total;
      } else if (paymentMethod === 'card') {
        cardAmount = total;
      } else {
        cashAmount = Math.max(0, Number(payment.cashAmount || 0));
        cardAmount = Math.max(0, Number(payment.cardAmount || 0));
        const splitTotal = Number((cashAmount + cardAmount).toFixed(2));
        const orderTotal = Number(total.toFixed(2));

        if (cashAmount <= 0 || cardAmount <= 0) {
          return res.status(400).json({ success: false, message: 'Mixed payment must include both cash and card amounts' });
        }

        if (Math.abs(splitTotal - orderTotal) > 0.01) {
          return res.status(400).json({ success: false, message: 'Cash and card amounts must match the POS total' });
        }
      }

      const order = await Order.create({
        user: null,
        createdBy: req.user?._id || null,
      salesChannel: 'pos',
      items: sanitizedItems,
      shippingAddress: {
        fullName,
        email: customer.email?.trim() || '',
        phone: customer.phone?.trim() || '',
        street: customer.street?.trim() || 'In-store pickup',
        city: customer.city?.trim() || 'Store',
        state: customer.state?.trim() || '',
        zipCode: customer.zipCode?.trim() || '00000',
        country: customer.country?.trim() || 'Turkey'
      },
        payment: {
          method: paymentMethod,
          cashAmount,
          cardAmount,
          status: 'paid'
        },
      subtotal,
      shippingCost: 0,
      discountAmount: parsedDiscount,
      total,
      status: 'delivered',
      notes: notes?.trim() || ''
    });

    try {
      await decrementOrderStock(sanitizedItems);
    } catch (err) {
      console.error('POS stock deduction failed', err);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('POS ORDER FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create POS order' });
  }
};

// @desc    Get POS summary for cashier/admin
// @route   GET /api/orders/pos/summary
// @access  Private/Admin/Cashier
exports.getPosSummary = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseFilter = { salesChannel: 'pos' };
    if (req.user?.role === 'cashier') {
      baseFilter.createdBy = req.user._id;
    }

    const [todayOrders, monthOrders, recentSales, topProductsRaw, lowProductsRaw] = await Promise.all([
      Order.find({ ...baseFilter, createdAt: { $gte: todayStart } }).sort({ createdAt: -1 }).lean(),
      Order.find({ ...baseFilter, createdAt: { $gte: monthStart } }).sort({ createdAt: -1 }).lean(),
      Order.find(baseFilter).sort({ createdAt: -1 }).limit(8).lean(),
      Order.aggregate([
        { $match: baseFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            quantitySold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 }
      ]),
      Product.find().sort({ stock: 1 }).limit(5).lean()
    ]);

    const salesByDayMap = monthOrders.reduce((acc, order) => {
      const day = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!acc[day]) {
        acc[day] = { date: day, total: 0, invoices: 0 };
      }
      acc[day].total += Number(order.total || 0);
      acc[day].invoices += 1;
      return acc;
    }, {});

    const recentSalesFormatted = recentSales.map((order) => ({
      _id: order._id,
      invoiceNumber: order.invoiceNumber,
      total: order.total,
      paymentMethod: order.payment?.method,
      createdAt: order.createdAt,
      customerName: order.shippingAddress?.fullName || 'Walk-in Customer',
      itemsCount: Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0
    }));

    const totalToday = todayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalMonth = monthOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalDiscountToday = todayOrders.reduce((sum, order) => sum + Number(order.discountAmount || 0), 0);
      const cashSalesToday = todayOrders.reduce((sum, order) => {
        const method = String(order.payment?.method || '').toLowerCase();
        if (method === 'cash') return sum + Number(order.payment?.cashAmount || order.total || 0);
        if (method === 'mixed') return sum + Number(order.payment?.cashAmount || 0);
        return sum;
      }, 0);
      const cardSalesToday = todayOrders.reduce((sum, order) => {
        const method = String(order.payment?.method || '').toLowerCase();
        if (method === 'card') return sum + Number(order.payment?.cardAmount || order.total || 0);
        if (method === 'mixed') return sum + Number(order.payment?.cardAmount || 0);
        return sum;
      }, 0);
    const mixedSalesToday = todayOrders
      .filter((order) => String(order.payment?.method || '').toLowerCase() === 'mixed')
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalProfitToday = todayOrders.reduce((sum, order) => {
      const orderCost = (order.items || []).reduce((costSum, item) => costSum + (Number(item.costPrice || 0) * Number(item.quantity || 0)), 0);
      return sum + (Number(order.total || 0) - orderCost);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        today: {
          totalSales: totalToday,
          invoices: todayOrders.length,
          pieces: todayOrders.reduce((sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0), 0),
          discountTotal: totalDiscountToday,
          estimatedProfit: totalProfitToday,
          cashSales: cashSalesToday,
          cardSales: cardSalesToday,
          mixedSales: mixedSalesToday
        },
        month: {
          totalSales: totalMonth,
          invoices: monthOrders.length,
          bestDay: Object.values(salesByDayMap).sort((a, b) => b.total - a.total)[0] || null,
          salesByDay: Object.values(salesByDayMap).sort((a, b) => a.date.localeCompare(b.date))
        },
        topProducts: topProductsRaw,
        lowProducts: lowProductsRaw.map((product) => ({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          stock: product.variants?.length ? (product.stockControl?.totalStock || 0) : (product.stock || 0)
        })),
        recentSales: recentSalesFormatted,
        recentTodaySales: recentSalesFormatted.filter((sale) => new Date(sale.createdAt) >= todayStart)
      }
    });
  } catch (error) {
    console.error('POS SUMMARY FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load POS summary' });
  }
};

// @desc    Get active cashier shift
// @route   GET /api/orders/pos/shift/current
// @access  Private/Admin/Cashier
exports.getCurrentPosShift = async (req, res) => {
  try {
    const targetCashierId = req.user?.role === 'cashier' ? req.user._id : (req.query.cashierId || req.user?._id);
    const shift = await CashierShift.findOne({ cashier: targetCashierId, status: 'open' })
      .populate('cashier', 'name email')
      .lean();

    if (!shift) {
      return res.status(200).json({ success: true, data: null });
    }

    const liveSummary = await buildShiftSummary(shift.cashier._id || shift.cashier, shift.openedAt);

    return res.status(200).json({
      success: true,
      data: {
        ...shift,
        ...liveSummary,
        expectedTotal: liveSummary.totalSales
      }
    });
  } catch (error) {
    console.error('GET CURRENT SHIFT FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load current shift' });
  }
};

// @desc    Open cashier shift
// @route   POST /api/orders/pos/shift/open
// @access  Private/Admin/Cashier
exports.openPosShift = async (req, res) => {
  try {
    const cashierId = req.user?._id;
    const existingShift = await CashierShift.findOne({ cashier: cashierId, status: 'open' });
    if (existingShift) {
      const populatedExisting = await CashierShift.findById(existingShift._id).populate('cashier', 'name email').lean();
      return res.status(200).json({
        success: true,
        reused: true,
        message: 'A shift is already open for this cashier',
        data: populatedExisting
      });
    }

    const openingFloat = Math.max(0, Number(req.body?.openingFloat || 0));
    const notes = String(req.body?.notes || '').trim();

    const shift = await CashierShift.create({
      cashier: cashierId,
      openingFloat,
      notes,
      status: 'open'
    });

    const populated = await CashierShift.findById(shift._id).populate('cashier', 'name email').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('OPEN SHIFT FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to open shift' });
  }
};

// @desc    Close cashier shift
// @route   POST /api/orders/pos/shift/close
// @access  Private/Admin/Cashier
exports.closePosShift = async (req, res) => {
  try {
    const cashierId = req.user?._id;
    const shift = await CashierShift.findOne({ cashier: cashierId, status: 'open' });
    if (!shift) {
      return res.status(404).json({ success: false, message: 'No active shift found to close' });
    }

    const liveSummary = await buildShiftSummary(cashierId, shift.openedAt);
    const actualCash = Math.max(0, Number(req.body?.actualCash ?? liveSummary.expectedCash ?? 0));
    const actualCard = Math.max(0, Number(req.body?.actualCard ?? liveSummary.expectedCard ?? 0));
    const notes = String(req.body?.notes || shift.notes || '').trim();

    shift.closedAt = new Date();
    shift.status = 'closed';
    shift.expectedCash = Number(liveSummary.expectedCash || 0);
    shift.expectedCard = Number(liveSummary.expectedCard || 0);
    shift.expectedTotal = Number(liveSummary.totalSales || 0);
    shift.actualCash = actualCash;
    shift.actualCard = actualCard;
    shift.actualTotal = actualCash + actualCard;
    shift.varianceCash = actualCash - shift.expectedCash;
    shift.varianceCard = actualCard - shift.expectedCard;
    shift.varianceTotal = shift.actualTotal - shift.expectedTotal;
    shift.invoicesCount = Number(liveSummary.invoicesCount || 0);
    shift.piecesCount = Number(liveSummary.piecesCount || 0);
    shift.discountTotal = Number(liveSummary.discountTotal || 0);
    shift.estimatedProfit = Number(liveSummary.estimatedProfit || 0);
    shift.notes = notes;
    await shift.save();

    const populated = await CashierShift.findById(shift._id).populate('cashier', 'name email').lean();
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error('CLOSE SHIFT FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to close shift' });
  }
};

// @desc    Void POS order and restore stock
// @route   PUT /api/orders/:id/void-pos
// @access  Private/Admin/Cashier
exports.voidPosOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'POS order not found' });
    }

    if (order.salesChannel !== 'pos') {
      return res.status(400).json({ success: false, message: 'This action is only available for POS orders' });
    }

    if (req.user?.role === 'cashier' && String(order.createdBy || '') !== String(req.user._id || '')) {
      return res.status(403).json({ success: false, message: 'You can only void your own POS sales' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This POS sale has already been voided' });
    }

    await restoreOrderStock(order.items || []);

    order.status = 'cancelled';
    order.payment.status = 'refunded';
    order.notes = [order.notes, req.body?.reason ? `VOID: ${String(req.body.reason).trim()}` : 'VOID: POS sale cancelled']
      .filter(Boolean)
      .join('\n');
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('VOID POS ORDER FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to void POS order' });
  }
};

// @desc    Reset demo sales, orders, analytics, and targets
// @route   POST /api/orders/reset-demo
// @access  Private/Admin/Cashier
exports.resetDemoData = async (req, res) => {
  try {
    const orders = await Order.find().lean();

    for (const order of orders) {
      if (Array.isArray(order.items) && order.items.length > 0) {
        await restoreOrderStock(order.items);
      }
    }

    const [ordersResult, analyticsResult, shiftsResult] = await Promise.all([
      Order.deleteMany({}),
      Analytics.deleteMany({}),
      CashierShift.deleteMany({})
    ]);

    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    settings.monthlySalesTarget = 0;
    settings.weeklySalesTarget = 0;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Demo data reset successfully',
      data: {
        ordersDeleted: ordersResult.deletedCount || 0,
        visitsDeleted: analyticsResult.deletedCount || 0,
        shiftsDeleted: shiftsResult.deletedCount || 0
      }
    });
  } catch (error) {
    console.error('RESET DEMO DATA FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to reset demo data' });
  }
};

// @desc    Get recent POS shifts
// @route   GET /api/orders/pos/shifts
// @access  Private/Admin
exports.getPosShifts = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 8)));
    const shifts = await CashierShift.find()
      .populate('cashier', 'name email')
      .sort({ openedAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    console.error('GET POS SHIFTS FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load shifts' });
  }
};

// @desc    Get staff order alerts for new online orders
// @route   GET /api/orders/alerts
// @access  Private/Admin/Cashier
exports.getOrderAlerts = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 8)));
    const statuses = ['pending_payment', 'pending', 'processing'];
    const orders = await Order.find({
      salesChannel: 'online',
      status: { $in: statuses }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .lean();

    const alerts = orders.map((order) => ({
      _id: order._id,
      invoiceNumber: order.invoiceNumber,
      status: order.status,
      total: Number(order.total || 0),
      createdAt: order.createdAt,
      paymentMethod: order.payment?.method || 'unknown',
      customerName: order.shippingAddress?.fullName || order.user?.name || 'Guest customer',
      customerEmail: order.shippingAddress?.email || order.user?.email || '',
      receiptImage: order.payment?.receiptImage || '',
      needsReview: order.status === 'pending_payment'
    }));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('GET ORDER ALERTS FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load alerts' });
  }
};

// @desc    Mark online order alert as preparing
// @route   PUT /api/orders/:id/prepare
// @access  Private/Admin/Cashier
exports.markOrderPreparing = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.salesChannel !== 'online') {
      return res.status(400).json({ success: false, message: 'Only online orders can be prepared from alerts' });
    }

    if (order.status === 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'This order is still waiting for payment confirmation'
      });
    }

    order.status = 'processing';
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order moved to processing'
    });
  } catch (error) {
    console.error('MARK ORDER PREPARING FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update order status' });
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

// @desc    Get all orders (Paginated + Server-side Search)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
     const page = parseInt(req.query.page, 10) || 1;
     const limit = parseInt(req.query.limit, 10) || 15;
     const search = req.query.search || '';
     const status = req.query.status || 'All';

     let matchCriteria = {};
     if (status !== 'All') matchCriteria.status = status;

     // If searching by Order ID exactly:
     if (search && mongoose.Types.ObjectId.isValid(search)) {
        matchCriteria._id = new mongoose.Types.ObjectId(search);
     }

     const pipeline = [
       {
         $lookup: {
           from: "users",
           localField: "user",
           foreignField: "_id",
           as: "userData"
         }
       },
       { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } }
     ];

     // Regex text searching safely applied after lookup
     if (search && !mongoose.Types.ObjectId.isValid(search)) {
       pipeline.push({
         $match: {
           $or: [
             { "userData.name": { $regex: search, $options: 'i' } },
             { "userData.email": { $regex: search, $options: 'i' } },
             { "shippingAddress.fullName": { $regex: search, $options: 'i' } },
             { "shippingAddress.email": { $regex: search, $options: 'i' } },
             { "shippingAddress.phone": { $regex: search, $options: 'i' } }
           ]
         }
       });
     }

     // Apply status or ID matcher
     pipeline.push({ $match: matchCriteria });

     // Fetch Metadata + Paginate
     pipeline.push({
       $facet: {
         metadata: [{ $count: "total" }, { $addFields: { page: page } }],
         data: [{ $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }]
       }
     });

     const results = await Order.aggregate(pipeline);
     const total = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0;
     const data = results[0].data;

     // Format output back to simulate .populate() structure to save frontend refactor
     const formattedData = data.map(order => ({
        ...order,
        user: order.userData ? { 
           _id: order.userData._id, 
           name: order.userData.name, 
           email: order.userData.email 
        } : null
     }));

     res.status(200).json({ 
       success: true, 
       count: formattedData.length,
       total,
       page,
       pages: Math.ceil(total / limit),
       data: formattedData 
     });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
   try {
     const order = await Order.findById(req.params.id)
       .populate('user', 'name email')
       .populate('items.product', 'sku slug images'); // To support deep rendering checks

     if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
     
     // Enforce private ownership safely
     if (req.user.role !== 'admin' && (!order.user || order.user._id.toString() !== req.user._id.toString())) {
       return res.status(403).json({ success: false, message: 'User not authorized to read this order' });
     }

     res.status(200).json({ success: true, data: order });
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
    
    if (req.body.status) {
      order.status = req.body.status;
      if (req.body.status === 'processing' && order.payment.method === 'iban') {
        order.payment.status = 'paid';
      }
      if (req.body.status === 'cancelled' && order.payment.method === 'iban' && order.payment.status === 'pending_payment') {
        order.payment.status = 'failed';
      }
    }
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    
    await order.save();
    
    if (req.body.status === 'shipped' && order.user?.email) {
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
    if (req.user.role !== 'admin' && (!order.user || order.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this order' });
    }

    if (order.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an order that is already processing or shipped. Contact support.' });
    }

    order.status = 'cancelled';
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Mark order as paid (Manual for COD)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    order.payment.status = 'paid';
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get Aggregated Admin Stats
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const { timeframe } = req.query; // 'today', 'week', 'month', 'year', 'all'
    let dateFilter = {};
    const now = new Date();

    if (timeframe === 'today') {
      dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
    } else if (timeframe === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (timeframe === 'year') {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      dateFilter = { createdAt: { $gte: yearAgo } };
    }

    const User = require('../models/User');
    const Product = require('../models/Product');

    const [orders, users, products, topProductsAgg] = await Promise.all([
      Order.find(dateFilter),
      User.find(dateFilter),
      Product.find(dateFilter),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", qtysold: { $sum: "$items.quantity" }, name: { $first: "$items.name" } } },
        { $sort: { qtysold: -1 } },
        { $limit: 5 }
      ])
    ]);

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || curr.total || 0), 0);
    
    // Top 5 formatting
    const topProducts = topProductsAgg.map(p => ({
      id: p._id,
      name: p.name?.en || p.name || 'Unknown Product',
      quantitySold: p.qtysold
    }));

    // For Chart.js/Recharts: Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const revenueByDayRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $cond: [{ $isNumber: "$totalAmount" }, "$totalAmount", "$total"] } }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Donut chart: Orders by status
    const ordersByStatusRaw = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const ordersByStatus = ordersByStatusRaw.map(s => ({
      name: s._id || 'Pending',
      value: s.count
    }));

    // Trends: compare last 30 days to previous 30 days
    const sixtyDaysAgo = new Date(thirtyDaysAgo);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30);
    const lastMonthOrders = await Order.find({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
    const lastMonthUsers = await User.find({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
    
    const currMonthOrders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } });
    const currMonthUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } });

    const revLast = lastMonthOrders.reduce((acc, curr) => acc + (curr.totalAmount || curr.total || 0), 0);
    const revCurr = currMonthOrders.reduce((acc, curr) => acc + (curr.totalAmount || curr.total || 0), 0);
    
    const calculateTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const trends = {
      revenue: calculateTrend(revCurr, revLast),
      orders: calculateTrend(currMonthOrders.length, lastMonthOrders.length),
      users: calculateTrend(currMonthUsers.length, lastMonthUsers.length),
    };

    // Low stock alert (critical stock: 1-2 pieces only)
    const lowStockProductsRaw = await Product.find({ 
      $or: [
        { stock: { $lte: 2, $gt: 0 }, "variants.0": { $exists: false } },
        { "stockControl.totalStock": { $lte: 2, $gt: 0 } }
      ]
    }).limit(10).lean();

    const outOfStockProductsRaw = await Product.find({
      $or: [
        { stock: { $lte: 0 }, "variants.0": { $exists: false } },
        { "stockControl.totalStock": { $lte: 0 } }
      ]
    }).limit(10).lean();
    
    const lowStockAlerts = lowStockProductsRaw.map(p => ({
      id: p._id,
      name: p.name?.en || p.name,
      stock: p.variants?.length ? p.stockControl?.totalStock : p.stock,
      image: p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809'
    }));

    const Analytics = require('../models/Analytics');
    
    const dt = new Date();
    const todayStr = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    const todayStat = await Analytics.findOne({ date: todayStr });
    const visitsToday = todayStat ? todayStat.visits : 0;

    const dtWeek = new Date();
    dtWeek.setDate(dtWeek.getDate() - 7);
    const weekStr = dtWeek.getFullYear() + '-' + String(dtWeek.getMonth() + 1).padStart(2, '0') + '-' + String(dtWeek.getDate()).padStart(2, '0');
    const weekStats = await Analytics.aggregate([
      { $match: { date: { $gte: weekStr } } },
      { $group: { _id: null, total: { $sum: "$visits" } } }
    ]);
    const visitsWeek = weekStats.length > 0 ? weekStats[0].total : 0;

    const dtMonth = new Date();
    dtMonth.setMonth(dtMonth.getMonth() - 1);
    const monthStr = dtMonth.getFullYear() + '-' + String(dtMonth.getMonth() + 1).padStart(2, '0') + '-' + String(dtMonth.getDate()).padStart(2, '0');
    const monthStats = await Analytics.aggregate([
      { $match: { date: { $gte: monthStr } } },
      { $group: { _id: null, total: { $sum: "$visits" } } }
    ]);
    const visitsMonth = monthStats.length > 0 ? monthStats[0].total : 0;

    const totalVisitStats = await Analytics.aggregate([
      { $group: { _id: null, total: { $sum: "$visits" } } }
    ]);
    const visitsAllTime = totalVisitStats.length > 0 ? totalVisitStats[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders: orders.length,
        totalUsers: users.length,
        totalProducts: products.length,
        topProducts,
        revenueByDay: revenueByDayRaw.map(r => ({ date: r._id, revenue: r.revenue })),
        ordersByStatus,
        trends,
        lowStockAlerts,
        inventoryStats: {
          totalUnits: products.reduce((sum, product) => {
            const qty = product.variants?.length ? (product.stockControl?.totalStock || 0) : (product.stock || 0);
            return sum + qty;
          }, 0),
          lowStockCount: lowStockProductsRaw.length,
          outOfStockCount: outOfStockProductsRaw.length
        },
        visitorStats: {
          today: visitsToday,
          week: visitsWeek,
          month: visitsMonth,
          allTime: visitsAllTime
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error calculating stats' });
  }
};

// @desc    Export Orders to CSV
// @route   GET /api/orders/export
// @access  Private/Admin
exports.exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
    let csv = 'Order ID,Date,Customer Name,Customer Email,Total ($),Status,Payment Method\n';
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const name = order.user ? `"${order.user.name.replace(/"/g, '""')}"` : 'Guest';
      const email = order.user ? order.user.email : 'N/A';
      csv += `"${order._id}",${date},${name},${email},${order.total},${order.status},${order.payment.method}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Post-Checkout Receipt
// @route   POST /api/orders/:id/receipt
// @access  Public
exports.uploadOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const receiptImage = getUploadedReceiptUrl(req.file, req);
    if (!receiptImage) return res.status(400).json({ success: false, message: 'No valid receipt uploaded' });

    order.receiptUrl = receiptImage;
    await order.save();

    res.status(200).json({ success: true, message: 'Receipt uploaded successfully', receiptUrl: receiptImage });
  } catch (error) {
    console.error('RECEIPT UPLOAD FAILED', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload receipt' });
  }
};
