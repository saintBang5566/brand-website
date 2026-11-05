'use strict';

const { required } = require('./config');
const { cookies } = require('./http');

async function request(path, options = {}, service = true) {
  const key = service ? required('SUPABASE_SERVICE_ROLE_KEY') : (process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9jG8NCrcqRduBsrvW8sTjg_WmHA_PIR');
  const url = process.env.SUPABASE_URL || 'https://bgmeotvditfurcyemfku.supabase.co';
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options.headers }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw Object.assign(new Error(data?.message || data?.error || 'Supabase request failed'), { status: response.status });
  return data;
}

async function userFromToken(token) {
  if (!token) return null;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9jG8NCrcqRduBsrvW8sTjg_WmHA_PIR';
  const url = process.env.SUPABASE_URL || 'https://bgmeotvditfurcyemfku.supabase.co';
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return response.json();
}

async function requireUser(req) {
  const user = await userFromToken(cookies(req).ai_session);
  if (!user) throw Object.assign(new Error('請先登入會員。'), { status: 401 });
  return user;
}

function table(name, query = '', options = {}) {
  return request(`/rest/v1/${name}${query}`, options);
}

module.exports = { request, userFromToken, requireUser, table };
