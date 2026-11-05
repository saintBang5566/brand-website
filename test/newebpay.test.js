'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { encrypt, decrypt, sha, safeEqual } = require('../api/_lib/newebpay');
const key='12345678901234567890123456789012', iv='1234567890123456';
test('NewebPay payload round trip and signature verification',()=>{const encrypted=encrypt({MerchantID:'MS123',Amt:'2000',ItemDesc:'Codex線上課程'},key,iv);assert.deepEqual(decrypt(encrypted,key,iv),{MerchantID:'MS123',Amt:'2000',ItemDesc:'Codex線上課程'});const signature=sha(encrypted,key,iv);assert.equal(signature.length,64);assert.equal(safeEqual(signature,signature.toLowerCase()),true);assert.equal(safeEqual(signature,'bad'),false)});
