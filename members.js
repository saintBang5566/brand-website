'use strict';
(() => {
  const root = document.querySelector('#members');
  if (!root) return;
  const config = window.AI_FEIREN_MEMBERS || {};
  const form = root.querySelector('#member-login');
  const email = root.querySelector('#member-email');
  const submit = root.querySelector('#member-submit');
  const message = root.querySelector('#member-message');
  const account = root.querySelector('#member-account');
  const address = root.querySelector('#member-address');
  const tier = root.querySelector('#member-tier');
  const library = root.querySelector('#member-library');
  const libraryStatus = root.querySelector('#member-library-status');
  const logout = root.querySelector('#member-logout');
  const refresh = root.querySelector('#member-refresh');
  let client;
  let generation = 0;
  let resendAt = 0;
  const say = (text, error = false) => {
    message.textContent = text;
    message.dataset.error = String(error);
  };
  const clearLibrary = () => { library.replaceChildren(); libraryStatus.textContent = ''; };
  const signedOut = () => {
    generation++;
    form.hidden = false;
    account.hidden = true;
    address.textContent = '';
    tier.textContent = '';
    clearLibrary();
  };
  const readyConfig = () => {
    try {
      const url = new URL(config.supabaseUrl);
      return url.protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/.test(url.hostname)
        && !url.username && !url.password && url.pathname === '/'
        && typeof config.publishableKey === 'string' && config.publishableKey.startsWith('sb_publishable_');
    } catch { return false; }
  };
  const labels = { active: '訂閱有效', trialing: '試用中', canceled: '已取消續訂，有效期限內仍可閱讀', past_due: '付款待處理', expired: '訂閱已到期' };
  async function loadAccount() {
    const revision = ++generation;
    clearLibrary();
    tier.textContent = '正在核對會員狀態…';
    const { data, error } = await client.auth.getUser();
    if (revision !== generation) return;
    if (error || !data?.user) {
      signedOut();
      if (error) say('目前無法確認登入狀態，請重新登入或稍後重試。', true);
      return;
    }
    const user = data.user;
    form.hidden = true;
    account.hidden = false;
    address.textContent = user.email || '已登入會員';
    const access = await client.from('membership_access')
      .select('status,plan_name,expires_at').eq('user_id', user.id).maybeSingle();
    if (revision !== generation) return;
    if (access.error) {
      tier.textContent = '會員權限暫時無法讀取';
      libraryStatus.textContent = '請稍後重新整理。尚未確認付費資格。';
      return;
    }
    const entry = access.data;
    if (!entry) {
      tier.textContent = '免費會員';
      libraryStatus.textContent = '目前沒有有效付費訂閱。訂閱方案仍在籌備，尚未開放收款。';
      return;
    }
    const eligible = ['active', 'trialing', 'canceled'].includes(entry.status)
      && Date.parse(entry.expires_at) > Date.now();
    tier.textContent = eligible ? (labels[entry.status] || '訂閱有效') : (Date.parse(entry.expires_at) <= Date.now() ? '訂閱已到期' : (labels[entry.status] || '目前無有效訂閱'));
    if (eligible) {
      tier.textContent += '，至 ' + new Intl.DateTimeFormat('zh-TW', {timeZone:'Asia/Taipei',dateStyle:'medium'}).format(new Date(entry.expires_at));
    } else {
      libraryStatus.textContent = '訂閱未生效或已到期；若剛完成付款，請稍後重新核對。';
      return;
    }
    const result = await client.from('member_posts').select('id,title,body,published_at')
      .order('published_at', {ascending:false}).limit(20);
    if (revision !== generation) return;
    if (result.error) { libraryStatus.textContent = '會員內容暫時無法讀取，請稍後重試。'; return; }
    if (!result.data?.length) { libraryStatus.textContent = '目前尚無已發布的會員內容。'; return; }
    for (const post of result.data) {
      const article = document.createElement('article');
      const heading = document.createElement('h3');
      const body = document.createElement('p');
      heading.textContent = post.title;
      body.textContent = post.body;
      body.className = 'member-post-body';
      article.append(heading, body);
      library.append(article);
    }
    libraryStatus.textContent = `已載入 ${result.data.length} 篇會員內容。`;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!client || !form.reportValidity()) return;
    if (Date.now() < resendAt) { say('登入信已寄送，請稍候再試。'); return; }
    submit.disabled = true;
    say('正在寄送登入信…');
    try {
      const { error } = await client.auth.signInWithOtp({
        email: email.value.trim(),
        options: { shouldCreateUser: true, emailRedirectTo: config.siteUrl },
      });
      if (error) { say('登入信未寄出。請稍後再試；若持續失敗，請用網站 Email 聯絡。', true); return; }
      resendAt = Date.now() + 60000;
      say('登入信已寄出。請在這個瀏覽器開啟信中的連結；若找不到，也請檢查垃圾郵件。');
    } catch { say('連線中斷，請檢查網路後再試。', true); }
    finally { submit.disabled = false; }
  });
  logout.addEventListener('click', async () => {
    logout.disabled = true;
    try {
      const { error } = await client.auth.signOut();
      if (error) { say('登出未完成，請重試。', true); return; }
      signedOut(); say('已登出。');
    } catch { say('登出未完成，請檢查連線後重試。', true); }
    finally { logout.disabled = false; }
  });
  refresh.addEventListener('click', async () => {
    refresh.disabled = true;
    try { await loadAccount(); } catch { say('目前無法連線，請稍後重試。', true); }
    finally { refresh.disabled = false; }
  });
  async function start() {
    if (!readyConfig()) {
      submit.disabled = true;
      email.disabled = true;
      say('會員登入服務尚在設定中，現在不會寄送登入信。你可以先透過 Email 詢問訂閱進度。');
      return;
    }
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.76.1');
      client = createClient(config.supabaseUrl, config.publishableKey, {
        auth: {flowType:'pkce', persistSession:true, autoRefreshToken:true, detectSessionInUrl:true},
      });
      client.auth.onAuthStateChange(event => {
        if (event === 'SIGNED_OUT') { signedOut(); return; }
        if (['SIGNED_IN', 'TOKEN_REFRESHED'].includes(event)) {
          setTimeout(() => loadAccount().catch(() => say('目前無法讀取會員資料。', true)), 0);
        }
      });
      submit.disabled = false;
      email.disabled = false;
      say('輸入 Email 取得一次性登入連結；新用戶將同時建立免費會員帳號。');
      await loadAccount();
      if (new URLSearchParams(location.search).has('code')) {
        const url = new URL(location.href); url.searchParams.delete('code');
        history.replaceState(null, '', url.pathname + url.search + '#members');
      }
    } catch {
      signedOut(); submit.disabled = true;
      say('登入服務暫時無法載入，請重新整理或稍後再試。', true);
    }
  }
  start();
})();
