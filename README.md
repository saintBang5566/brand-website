# AI 廢人網站初稿
繁體中文、響應式、靜態品牌網站，不含第三方追蹤；會員啟用後載入固定版本的 Supabase SDK。使用原創 CSS/SVG 示意素材。

啟動：`python3 -m http.server 8090 --bind 127.0.0.1 --directory /workspace/codex-workspace/website`

正式發布只需部署 index.html、styles.css、app.js 與 assets/ 到靜態網站主機。不要發布整個工作區或 .agents、.codex 等目錄。現有雲端環境沒有已驗證的外部預覽入口。

目前可用：三個服務入口、作品方向篩選、手機導覽、課綱彈窗、需求摘要生成、文字檔下載與帶入 Email 草稿（訪客需自行寄送）。

已補會員前端與資料表設定草案；Supabase 專案 ai-feiren-members 已建立，資料表權限已驗證；登入尚待網址與寄信設定完成後啟用。尚未串接金流、付費影片權限、私人 LINE 交付及自動表單收件。摘要僅在瀏覽器記憶體產生，不會上傳或儲存。無登入或付款按鈕假裝可用。

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

會員後端：bgmeotvditfurcyemfku。月費 NT$500 已由本人確認，尚未接通金流／自動扣款。authEnabled 在完成 Auth URL 與寄信實測前保持 false。

## Codex 基礎使用課程
確認售價NT$2,000，影片尚未完成，保持未開賣。member.html / member.js提供課程購買流程與會員介面；GitHub Pages沒有後端，這裡明確停用註冊及付款。現有Supabase會員區、Threads與NT$500/月訂閱規劃保留。課程與訂閱權限分開。

本機後端原始碼位於私人工作區course-platform/，沒有發布到此靜態網站；真實身分/付款/影片服務須另外部署。正式課程會使用同一Supabase會員身分，尚未完成SMTP、正式主機、觀看期限、交易條款與藍新測試交易；不代表現已能收款或觀看。
