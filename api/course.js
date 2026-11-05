'use strict';
const { json, method } = require('./_lib/http');
const { requireUser, table, request } = require('./_lib/supabase');
const { courseId } = require('./_lib/config');
module.exports = async (req, res) => {
  if (!method(req, res, ['GET'])) return;
  try {
    const user = await requireUser(req);
    const access = await table('course_entitlements', `?user_id=eq.${user.id}&course_id=eq.${courseId}&status=eq.active&expires_at=gt.${new Date().toISOString()}&select=expires_at&limit=1`);
    if (!access.length) return json(res, 403, { error: '尚未取得這門課的觀看權限。' });
    const lessons = await table('course_lessons', `?course_id=eq.${courseId}&active=eq.true&select=id,title,video_path,sort_order&order=sort_order.asc`);
    const signed = await Promise.all(lessons.map(async lesson => {
      if (!lesson.video_path) return { id: lesson.id, title: lesson.title, available: false };
      const data = await request(`/storage/v1/object/sign/course-videos/${lesson.video_path}`, { method: 'POST', body: JSON.stringify({ expiresIn: 300 }) });
      return { id: lesson.id, title: lesson.title, available: true, url: `${process.env.SUPABASE_URL}/storage/v1${data.signedURL}` };
    }));
    json(res, 200, { mode: process.env.NEWEBPAY_ENV === 'production' ? 'production' : 'sandbox', lessons: signed });
  } catch (error) { json(res, error.status || 500, { error: error.status ? error.message : '課程暫時無法載入。' }); }
};
