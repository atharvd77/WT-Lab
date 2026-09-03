const express = require('express');
const { Op } = require('sequelize');
const { Book } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || 'relevance';

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const order = [];
    if (sort === 'price_asc') order.push(['price', 'ASC']);
    if (sort === 'price_desc') order.push(['price', 'DESC']);
    if (sort === 'rating') order.push(['rating', 'DESC']);
    if (sort === 'newest') order.push(['createdAt', 'DESC']);
    if (!order.length) order.push(['featured', 'DESC'], ['bestseller', 'DESC'], ['createdAt', 'DESC']);

    const { count, rows } = await Book.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return sendSuccess(res, {
      books: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }, 'Books fetched successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return sendError(res, 'Book not found', 404);
    }
    return sendSuccess(res, { book }, 'Book fetched successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
