# Email Gate 部署指南

## 流程
```
使用者進入網頁 → 跳出 Email Gate → 送 Email →
Apps Script 檢查重複 →
  └ 重複：直接解鎖 + 提示「已使用過」
  └ 新：寫入 Sheet + 寄歡迎信 + 解鎖
解鎖狀態存在 localStorage（devLetterTool.unlocked = "1"）
```

---

## Step 1：建立 Google Sheet
1. 開新的 Google Sheet，命名「房仲開發信工具 · Email 名單」
2. 工作表分頁名改成 `名單`（或自訂後同步改 Code.gs 的 `SHEET_NAME`）
3. 從網址抓 Sheet ID：`https://docs.google.com/spreadsheets/d/【這串】/edit`

## Step 2：設定 Apps Script
1. 打開該 Sheet → 上方選單「擴充功能」→「Apps Script」
2. 把 `Code.gs` 全部內容貼進去（覆蓋預設 myFunction）
3. 改最上面的設定區：
   ```js
   const SHEET_ID   = '貼你剛剛抓的 ID';
   const SHEET_NAME = '名單';   // 跟 Sheet 分頁名一致
   const TOOL_URL   = 'https://dev-letter-tool.vercel.app/';
   ```
4. 存檔（Ctrl+S）

## Step 3：先測一下後端
1. Apps Script 編輯器左側選 `_test` 函式 → 點「執行」
2. 第一次會跳授權：
   - 選你的 Gmail
   - 點「進階」→「前往（不安全）」→「允許」
3. 跑完看「執行記錄」應出現 `{"status":"ok","message":"歡迎信已寄出..."}`
4. 回 Sheet 確認有新增一筆 `test@example.com`，並收到測試信
5. **測完記得把 Sheet 那一筆 test 資料刪掉**

## Step 4：部署成 Web App
1. Apps Script 右上「部署」→「新增部署作業」
2. 齒輪 → 選「網頁應用程式」
3. 設定：
   - **說明**：dev-letter-tool email gate v1
   - **執行身分**：我（你的 Gmail）
   - **存取權限**：**所有人**（不能選「擁有 Google 帳戶的所有人」，否則前端 fetch 會被擋）
4. 「部署」→ 複製「網頁應用程式 URL」（長得像 `https://script.google.com/macros/s/AKfy.../exec`）

## Step 5：貼回前端
打開 `index.html`，找到這行（約在 `bindEmailGate` 上方）：
```js
const EMAIL_GATE_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```
換成剛剛複製的 URL。

## Step 6：上線
```bash
cd C:/Users/sally/dev-letter-tool
git add index.html
git commit -m "feat: add email gate for unlock"
git push
```
Vercel 自動部署，約 1-2 分鐘。

---

## 之後如何更新 Apps Script
改完 `Code.gs` 後 → **必須點「部署」→「管理部署作業」→ 編輯（鉛筆圖示）→ 版本選「新版本」→ 部署**
（直接存檔不會生效，因為 Web App 鎖在某個版本上）

## 容量上限（免費 Gmail）
- `MailApp.sendEmail` 一天 100 封
- 一天 100 個新使用者就到頂；目前推廣量沒問題，超過再考慮 Mailchimp/Resend

## 排錯
| 症狀 | 原因 |
|---|---|
| 前端送出後跳「連線失敗」 | Web App 部署存取權限沒選「所有人」 |
| 收到 `{status:"error", message:"..."}` | 看 message，多半是 SHEET_ID 沒改、或工作表名稱對不上 |
| 重複檢查沒生效 | Email 比對是 lowercase + trim，Sheet B 欄手動填過大小寫不一的可以重新統一 |
| 沒收到歡迎信 | 看垃圾信件夾；或 Apps Script 執行記錄有沒有 quota 警告 |

## 想看名單
- 直接開 Sheet 即可
- 或之後做個 dashboard，從 Apps Script 加一個 `doGet` 帶 token 的 API 抓總數

## 想重新解鎖（測試用）
瀏覽器 Console：
```js
localStorage.removeItem('devLetterTool.unlocked'); location.reload();
```
