# 會員登入與付費訂閱接入

## 已實作的程式

- Email 一次性連結登入／免費帳號建立、登出與狀態刷新。
- 會員資格由 Supabase membership_access 表查詢，不信任使用者可修改的 metadata 或瀏覽器按鈕狀態。
- 會員文章由受 RLS 限制的 member_posts 表取得，不放在公開 GitHub 原始碼。
- 未設定後端時清楚顯示服務設定中，不寄信、不宣稱登入成功。
- 訂閱方案、金流及價格尚未確認，頁面不提供假付款或自動開通。

## 啟用前

1. 選定 Supabase 組織及專案。目前連接帳戶查無既有專案。建立專案前核對所屬組織與報價，不預設使用者同意任何費用。
2. 在該專案審閱並執行 backend/membership-setup.sql。它是設定草案，不是已執行的 migration。檢查 Data API 是否暴露 public schema。
3. Auth Site URL 與 Redirect allowlist 設為 https://saintbang5566.github.io/brand-website/ 。Email provider 啟用；維持 Magic Link 郵件模板的 ConfirmationURL。正式對外寄信需可用寄信服務及網域設定，驗證預設寄信限制。
4. member-config.js 填該專案 HTTPS URL 與 sb_publishable_ 公開金鑰。絕不能放 service_role、sb_secret、SMTP 密碼、金流私鑰或付款 webhook secret。
5. 固定版本 SDK 由 esm.sh 載入，須驗證使用者環境可達。正式登入需在 HTTPS 網站上使用同一瀏覽器開啟登入信。
6. 準備會員隱私、服務與退款條款，以及實際課程內容；正式收款前完成審閱。

## 付款整合仍待完成

先確定商家所在地、收款資格、幣別、價格、週期與金流平台。GitHub Pages 無法保管秘密或驗證 webhook，付款後端需部署在受支援的伺服器／Edge Function。

登入會員取得付款連結時，後端驗證 JWT，從伺服器價目表選擇方案並綁定 auth user_id。驗證過簽章的付款 webhook 才能更新 membership_access。事件 ID 必須去重；處理續訂、付款失敗、取消續訂、退款與撤權，不從瀏覽器返回網址判定付款成功。

會員可取消續訂但保留已付費期間的權限，因此 canceled 且 expires_at 未到期仍可讀；退款／撤權需後端立即設定 expired 或終止時間。

ChatGPT 外掛登入不等於網站訪客會員，也不等於金流授權。

## 真實驗收清單

- 測試信箱建立帳號並收到登入信，回到正確 Pages 子路徑；登出後私人內容清空。
- 未登入直接讀兩表遭拒；免費會員看不到會員內容。
- 會員只能看自己的權限列，不能新增／更改／刪除會員資格。
- 有效與已取消但未到期會員能讀；逾期、欠款、未生效會員不能讀。
- 實際資料庫執行測試查詢與 advisors，記錄結果。未取得後端前只能驗證瀏覽器模擬契約，不稱登入已上線。
- 真實付款測試須在提供者測試環境驗證簽章、重送、取消、退款及跨帳號隔離，成功後才啟用正式金流。
