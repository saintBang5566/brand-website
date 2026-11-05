'use strict';
const { json, method } = require('../_lib/http');
module.exports = (req, res) => {
  if (!method(req, res, ['POST'])) return;
  res.setHeader('Set-Cookie', 'ai_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  json(res, 200, { ok: true });
};
