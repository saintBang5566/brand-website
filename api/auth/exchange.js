'use strict';
const { json, method, body } = require('../_lib/http');
const { userFromToken } = require('../_lib/supabase');
module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  const token = body(req).accessToken;
  const user = await userFromToken(token);
  if (!user) return json(res, 401, { error: '登入連結已失效，請重新登入。' });
  res.setHeader('Set-Cookie', `ai_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`);
  json(res, 200, { ok: true });
};
