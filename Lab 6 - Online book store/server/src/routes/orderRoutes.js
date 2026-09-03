const express = require("express");
const { Order, Book, Payment, Cart } = require("../models");
const { protect } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../utils/response");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, { orders }, "Orders fetched");
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { shippingAddress, items, paymentMethod = "cod" } = req.body;
    if (!shippingAddress || !items?.length) {
      return sendError(res, "Order details are required", 400);
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const book = await Book.findByPk(item.bookId);
      if (!book) return sendError(res, `Book ${item.bookId} not found`, 404);
      if (book.stock < Number(item.quantity))
        return sendError(res, `Insufficient stock for ${book.title}`, 400);

      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(book.price || 0);
      subtotal += unitPrice * quantity;

      orderItems.push({
        bookId: book.id,
        title: book.title,
        price: unitPrice,
        quantity,
        image: book.coverImage,
      });
    }

    const shippingFee = subtotal > 1000 ? 0 : 99;
    const total = subtotal + shippingFee;

    const newOrder = await Order.create({
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    await Payment.create({
      orderId: newOrder.id,
      userId: req.user.id,
      amount: total,
      currency: "INR",
      status: "created",
    });

    for (const item of orderItems) {
      const book = await Book.findByPk(item.bookId);
      if (book) {
        book.stock = Math.max(0, Number(book.stock) - Number(item.quantity));
        await book.save();
      }
    }

    await Cart.destroy({ where: { userId: req.user.id } });

    newOrder.paymentStatus = "paid";
    newOrder.orderStatus = "processing";
    await newOrder.save();

    return sendSuccess(res, { order: newOrder }, "Order created successfully");
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return sendError(res, "Order not found", 404);

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    await order.save();

    const payment = await Payment.findOne({ where: { orderId: order.id } });
    if (payment) {
      payment.status = "paid";
      await payment.save();
    }

    return sendSuccess(res, { order }, "Payment verified");
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!order) return sendError(res, "Order not found", 404);
    return sendSuccess(res, { order }, "Order fetched");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
