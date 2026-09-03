const express = require('express');
const { Cart, Book } = require('../models');
const { protect } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

const getCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const cart = await getCart(req.user.id);
    return sendSuccess(res, { items: cart.items }, 'Cart fetched');
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const book = await Book.findByPk(bookId);
    if (!book) return sendError(res, 'Book not found', 404);
    if (book.stock < quantity) return sendError(res, 'Insufficient stock', 400);

    const cart = await getCart(req.user.id);
    const items = [...cart.items];
    const itemIndex = items.findIndex((item) => item.bookId === Number(bookId));
    if (itemIndex >= 0) {
      items[itemIndex].quantity += Number(quantity);
    } else {
      items.push({ bookId: Number(bookId), quantity: Number(quantity), title: book.title, price: Number(book.price), image: book.coverImage });
    }

    cart.items = items;
    await cart.save();
    return sendSuccess(res, { items }, 'Book added to cart');
  } catch (error) {
    next(error);
  }
});

router.put('/:bookId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await getCart(req.user.id);
    const items = cart.items.map((item) => {
      if (item.bookId === Number(req.params.bookId)) {
        const nextQty = Number(quantity);
        return { ...item, quantity: nextQty };
      }
      return item;
    }).filter((item) => item.quantity > 0);

    cart.items = items;
    await cart.save();
    return sendSuccess(res, { items }, 'Cart updated');
  } catch (error) {
    next(error);
  }
});

router.delete('/:bookId', async (req, res, next) => {
  try {
    const cart = await getCart(req.user.id);
    cart.items = cart.items.filter((item) => item.bookId !== Number(req.params.bookId));
    await cart.save();
    return sendSuccess(res, { items: cart.items }, 'Item removed');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
