'use strict';

const courseId = 'codex-basics';
const price = 2000;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function paymentReady() {
  return ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEWEBPAY_MERCHANT_ID', 'NEWEBPAY_HASH_KEY', 'NEWEBPAY_HASH_IV', 'PUBLIC_SITE_URL']
    .every(name => Boolean(process.env[name]));
}

function gateway() {
  return process.env.NEWEBPAY_ENV === 'production'
    ? 'https://core.newebpay.com/MPG/mpg_gateway'
    : 'https://ccore.newebpay.com/MPG/mpg_gateway';
}

module.exports = { courseId, price, required, paymentReady, gateway };
