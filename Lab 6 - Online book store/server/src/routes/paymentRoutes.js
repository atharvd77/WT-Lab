const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

router.post('/create-order', async (req, res, next) => {
  try {
    if (!razorpay) {
      return sendError(res, 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to continue.', 503);
    }

    const { amount, currency = 'INR', receipt } = req.body;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `bookverse_${Date.now()}`,
    });
    return sendSuccess(res, { order }, 'Razorpay order created');
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { order_id, payment_id, signature } = req.body;
    const body = `${order_id}|${payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return sendError(res, 'Payment signature verification failed', 400);
    }

    return sendSuccess(res, { verified: true }, 'Signature verified');
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (signature !== expected) {
    return res.status(400).send('Invalid signature');
  }

  return res.status(200).json({ success: true });
});

module.exports = router;
