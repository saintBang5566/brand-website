'use strict';
const { json, method } = require('./_lib/http');
const { requireUser, table } = require('./_lib/supabase');
const { courseId } = require('./_lib/config');
module.exports = async (req, res) => {
  if (!method(req, res, ['GET'])) return;
  try {
    const user = await requireUser(req);
    const [orders, access] = await Promise.all([
      table('orders', `?user_id=eq.${user.id}&select=id,amount_twd,status,created_at&order=created_at.desc`),
      table('course_entitlements', `?user_id=eq.${user.id}&course_id=eq.${courseId}&status=eq.active&expires_at=gt.${new Date().toISOString()}&select=expires_at&limit=1`)
    ]);
    json(res, 200, { email: user.email, owned: access.length > 0, expires: access[0] ? Math.floor(new Date(access[0].expires_at).getTime() / 1000) : null, orders: orders.map(x => ({ id: x.id, amount: x.amount_twd, status: x.status })) });
  } catch (error) { json(res, error.status || 500, { error: error.status ? error.message : '會員資料暫時無法讀取。' }); }
};
