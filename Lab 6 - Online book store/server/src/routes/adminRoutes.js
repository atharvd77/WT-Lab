const express = require('express');
const { User, Book, Order, Review } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [bookCount, userCount, orderCount, revenueData] = await Promise.all([
      Book.count(),
      User.count(),
      Order.count(),
      Order.findAll({ attributes: ['id', 'total', 'createdAt'] })
    ]);

    const totalRevenue = revenueData.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return sendSuccess(res, {
      stats: {
        totalRevenue,
        orders: orderCount,
        customers: userCount,
        books: bookCount,
        lowStock: await Book.count({ where: { stock: { lt: 10 } } }),
      },
      recentOrders: revenueData.slice(0, 5),
    }, 'Dashboard fetched');
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    return sendSuccess(res, { users }, 'Users fetched');
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    return sendSuccess(res, { orders }, 'Orders fetched');
  } catch (error) {
    next(error);
  }
});

router.get('/inventory', async (req, res, next) => {
  try {
    const books = await Book.findAll({ order: [['stock', 'ASC']] });
    return sendSuccess(res, { books }, 'Inventory fetched');
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);
    order.orderStatus = req.body.orderStatus || order.orderStatus;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    await order.save();
    return sendSuccess(res, { order }, 'Order updated');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
