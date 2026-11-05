'use strict';
const crypto = require('node:crypto');
const { json, method, body } = require('./_lib/http');
const { requireUser, table } = require('./_lib/supabase');
const { encrypt, sha } = require('./_lib/newebpay');
const { courseId, price, required, paymentReady, gateway } = require('./_lib/config');
module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  try {
    if (!paymentReady() || process.env.COURSE_SALES_ENABLED !== 'true') return json(res, 503, { error: '課程目前尚未開放付款。' });
    const user = await requireUser(req);
    if (body(req).courseId !== courseId) return json(res, 400, { error: '課程資料不正確。' });
    const owned = await table('course_entitlements', `?user_id=eq.${user.id}&course_id=eq.${courseId}&status=eq.active&expires_at=gt.${new Date().toISOString()}&select=user_id&limit=1`);
    if (owned.length) return json(res, 409, { error: '這個帳號已經開通課程。' });
    const merchantOrderNo = `AI${Date.now()}${crypto.randomInt(1000, 9999)}`;
    await table('orders', '', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: user.id, course_id: courseId, merchant_order_no: merchantOrderNo, amount_twd: price, status: 'pending' }) });
    const site = required('PUBLIC_SITE_URL').replace(/\/$/, '');
    const params = { MerchantID: required('NEWEBPAY_MERCHANT_ID'), RespondType: 'String', TimeStamp: String(Math.floor(Date.now() / 1000)), Version: '2.0', MerchantOrderNo: merchantOrderNo, Amt: String(price), ItemDesc: 'Codex線上課程', Email: user.email, LoginType: '0', NotifyURL: `${site}/api/payments/newebpay/notify`, ReturnURL: `${site}/api/payments/newebpay/return` };
    const tradeInfo = encrypt(params, required('NEWEBPAY_HASH_KEY'), required('NEWEBPAY_HASH_IV'));
    json(res, 200, { action: gateway(), fields: { MerchantID: params.MerchantID, TradeInfo: tradeInfo, TradeSha: sha(tradeInfo, required('NEWEBPAY_HASH_KEY'), required('NEWEBPAY_HASH_IV')), Version: '2.0' } });
  } catch (error) { json(res, error.status || 500, { error: error.status ? error.message : '訂單建立失敗，請稍後再試。' }); }
};
