'use strict';
const { method } = require('../../_lib/http');
const { table } = require('../../_lib/supabase');
const { decrypt, sha, safeEqual } = require('../../_lib/newebpay');
const { required, courseId, price } = require('../../_lib/config');
module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  try {
    const payload = typeof req.body === 'string' ? Object.fromEntries(new URLSearchParams(req.body)) : (req.body || {});
    const key = required('NEWEBPAY_HASH_KEY'), iv = required('NEWEBPAY_HASH_IV');
    if (!payload.TradeInfo || !safeEqual(payload.TradeSha, sha(payload.TradeInfo, key, iv))) throw Error('invalid signature');
    const result = decrypt(payload.TradeInfo, key, iv);
    if (result.Status !== 'SUCCESS') throw Error('payment failed');
    const detail = typeof result.Result === 'string' ? JSON.parse(result.Result || '{}') : (result.Result || {});
    if (detail.MerchantID !== required('NEWEBPAY_MERCHANT_ID') || Number(detail.Amt) !== price) throw Error('payment mismatch');
    const orders = await table('orders', `?merchant_order_no=eq.${encodeURIComponent(detail.MerchantOrderNo)}&course_id=eq.${courseId}&amount_twd=eq.${price}&select=id,user_id,status&limit=1`);
    const order = orders[0]; if (!order) throw Error('order not found');
    if (order.status !== 'paid') {
      await table('orders', `?id=eq.${order.id}&status=eq.pending`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'paid', trade_no: String(detail.TradeNo || ''), paid_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
      await table('course_entitlements', '?on_conflict=user_id,course_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify({ user_id: order.user_id, course_id: courseId, order_id: order.id, status: 'active', starts_at: new Date().toISOString(), expires_at: new Date(Date.now() + 365 * 86400000).toISOString() }) });
    }
    res.statusCode = 200; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.end('1|OK');
  } catch { res.statusCode = 400; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.end('0|ERROR'); }
};
