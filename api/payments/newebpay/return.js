'use strict';
const { method } = require('../../_lib/http');
const { required } = require('../../_lib/config');
module.exports = (req, res) => {
  if (!method(req, res, ['GET', 'POST'])) return;
  res.statusCode = 303;
  res.setHeader('Location', `${required('PUBLIC_SITE_URL').replace(/\/$/, '')}/member.html?payment=returned`);
  res.end();
};
