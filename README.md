# AI 廢人網站初稿
繁體中文、響應式、靜態品牌網站，不含第三方追蹤；會員啟用後載入固定版本的 Supabase SDK。使用原創 CSS/SVG 示意素材。

啟動：`python3 -m http.server 8090 --bind 127.0.0.1 --directory /workspace/codex-workspace/website`

正式發布只需部署 index.html、styles.css、app.js 與 assets/ 到靜態網站主機。不要發布整個工作區或 .agents、.codex 等目錄。現有雲端環境沒有已驗證的外部預覽入口。

目前可用：三個服務入口、作品方向篩選、手機導覽、課綱彈窗、需求摘要生成、文字檔下載與帶入 Email 草稿（訪客需自行寄送）。

會員前端已接 Supabase Email 登入；Vercel API 已包含藍新付款建立訂單、回呼驗章、365 天課程權限與私有影片短效網址。正式密鑰與 `COURSE_SALES_ENABLED=true` 尚未設定時，付款按鈕會保持停用。

上線前必須補齊：
- 正式品牌名稱、Logo、個人介紹與聯絡方式。
- 有權公開的作品、客戶案例與可核實的成果。
- 正式課程、試看片、價格、開課時程、授課與更新範圍。
- 收款、發票、退款條款、隱私政策及個資處理流程。
- 真實量化研究資料、成本、期間、資料來源與限制；不得將目前合成曲線當績效。
- 網域、主機、正式 canonical / social metadata 與 sitemap（確定網域後設定）。

品牌為 AI 廢人；所有課程為規劃，所有案例視覺為示意，不代表已完成商業交付。

公開聯絡：Facebook 分享連結（未驗證為直達私訊）及 mummy110044@gmail.com。私人 LINE 不寫入公開程式碼。

新增公開社群：Instagram short_videos8888、TikTok teemofungi0308；僅使用帳號頁，不假設支援私訊。Threads short_videos8888 已補入。

會員啟用與實際驗收見 MEMBERSHIP_SETUP.md。會員文章不可放進公開 GitHub；身份與資格由後端驗證。Supabase SDK 固定 2.76.1，由 esm.sh 載入；未配置時不載入也不寄信。

會員後端：bgmeotvditfurcyemfku。會員登入已啟用；月費 NT$500 訂閱規劃與本次單次購課分開。
## Codex 基礎使用課程
確認售價 NT$2,000，單次付款後可在會員網頁觀看 365 天。影片尚未完成，`COURSE_SALES_ENABLED` 保持 false；課程與訂閱權限分開。

正式開賣前需在 Vercel 設定 `.env.example` 所列變數、完成藍新測試交易，並將課程影片上傳至私有 `course-videos` bucket，再新增 `course_lessons` 記錄。金流密鑰及 service role key 只能放在 Vercel 伺服器環境變數。

正式商店網址規劃為 https://aimakemoney.com.tw/，使用 Vercel 部署；已加入惜光商行資訊、課程價格、交付方式、服務條款、退款政策及隱私權政策。
