'use strict';
const { json, method } = require('./_lib/http');
const { courseId, price, paymentReady } = require('./_lib/config');
module.exports = (req, res) => {
  if (!method(req, res, ['GET'])) return;
  json(res, 200, { authMode: 'supabase', mode: process.env.NEWEBPAY_ENV === 'production' ? 'production' : 'sandbox', checkoutEnabled: paymentReady() && process.env.COURSE_SALES_ENABLED === 'true', course: { id: courseId, name: 'Codex 基礎使用', price } });
};
