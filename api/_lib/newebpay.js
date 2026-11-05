'use strict';

const crypto = require('node:crypto');

function encrypt(params, key, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([cipher.update(new URLSearchParams(params).toString(), 'utf8'), cipher.final()]).toString('hex');
}

function decrypt(tradeInfo, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const plain = Buffer.concat([decipher.update(Buffer.from(tradeInfo, 'hex')), decipher.final()]).toString('utf8');
  if (plain.trim().startsWith('{')) return JSON.parse(plain);
  return Object.fromEntries(new URLSearchParams(plain));
}

function sha(tradeInfo, key, iv) {
  return crypto.createHash('sha256').update(`HashKey=${key}&${tradeInfo}&HashIV=${iv}`).digest('hex').toUpperCase();
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || '').toUpperCase());
  const y = Buffer.from(String(b || '').toUpperCase());
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = { encrypt, decrypt, sha, safeEqual };
