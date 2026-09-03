const express = require('express');
const { Review, Book } = require('../models');
const { protect } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

router.use(protect);

router.get('/book/:bookId', async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { bookId: req.params.bookId },
      include: 'User',
      order: [['createdAt', 'DESC']],
    });
    return sendSuccess(res, { reviews }, 'Reviews fetched');
  } catch (error) {
    next(error);
  }
});

router.post('/book/:bookId', async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const existing = await Review.findOne({ where: { userId: req.user.id, bookId: req.params.bookId } });
    if (existing) {
      return sendError(res, 'You already reviewed this book', 400);
    }

    const review = await Review.create({ userId: req.user.id, bookId: req.params.bookId, rating, comment });
    const book = await Book.findByPk(req.params.bookId);
    const allReviews = await Review.findAll({ where: { bookId: req.params.bookId } });
    const total = allReviews.reduce((sum, item) => sum + item.rating, 0);
    const avg = total / allReviews.length;

    book.rating = avg;
    book.numReviews = allReviews.length;
    await book.save();

    return sendSuccess(res, { review }, 'Review added', 201);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
