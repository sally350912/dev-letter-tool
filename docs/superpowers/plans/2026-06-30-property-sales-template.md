# Property Sales Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增不需 AI API 的房屋銷售文案寫手，並產生 A4 橫式與 16:9 社群版成品。

**Architecture:** 保留既有 `index.html` 主程式，新增 `property-sales.js` 封裝形容詞庫、口吻句型、驗證與文案組合，新增 `property-sales.css` 專管兩種輸出畫布。`index.html` 只負責新模式表單、狀態同步、預覽與輸出事件，避免改動既有兩種 builder。

**Tech Stack:** HTML、原生 CSS、原生 JavaScript、Tailwind CDN、Node.js `node:test`

---

### Task 1: 句型引擎測試與資料模型

**Files:**
- Create: `tests/property-sales.test.mjs`
- Create: `property-sales.js`

- [ ] **Step 1: 寫入失敗測試**

測試四種 tone、六類標籤、必要欄位驗證、文案四段輸出、同輸入切換 variant、HTML escaping 與獨立 storage key。

- [ ] **Step 2: 執行紅燈測試**

Run: `node --test tests/property-sales.test.mjs`

Expected: FAIL，找不到 `property-sales.js`。

- [ ] **Step 3: 實作最小句型引擎**

建立全域 `PropertySales`，包含 `FEATURE_GROUPS`、`TONES`、`createDefaultState()`、`validateProperty()`、`generateCopy()`、`escapeHTML()`、`STORAGE_KEY`。Node 環境使用 `module.exports` 匯出同一物件。

- [ ] **Step 4: 執行綠燈測試**

Run: `node --test tests/property-sales.test.mjs`

Expected: 全部 PASS。

- [ ] **Step 5: 提交**

Run: `git add property-sales.js tests/property-sales.test.mjs && git commit -m "feat: add property sales copy engine"`

### Task 2: 房屋銷售模式與表單

**Files:**
- Modify: `index.html`
- Modify: `tests/ui-flow.test.mjs`

- [ ] **Step 1: 擴充失敗測試**

檢查 `modePropertyBtn`、必要欄位、六類特色容器、四個 tone 按鈕、可編輯文案欄位、尺寸切換與 `property-sales.js` 載入。

- [ ] **Step 2: 執行紅燈測試**

Run: `node --test tests/ui-flow.test.mjs`

Expected: FAIL，缺少房屋銷售模式。

- [ ] **Step 3: 新增模式入口與表單**

在模式選擇加入「房屋銷售」，新增物件標題、生活圈、總價、坪數、房型、樓層、屋齡、車位、管理費、編號、主照片及補充欄位；特色使用 checkbox chips，口吻使用 radio-like buttons。

- [ ] **Step 4: 新增文案編輯區**

加入「產生文案」「換一版」按鈕與標題、開場、賣點、CTA 四個可編輯欄位。若使用者已編輯，重新生成前使用 `confirm()` 防止覆蓋。

- [ ] **Step 5: 執行測試並提交**

Run: `node --test tests/ui-flow.test.mjs tests/property-sales.test.mjs`

Expected: 全部 PASS。

Run: `git add index.html tests/ui-flow.test.mjs && git commit -m "feat: add property sales editor workflow"`

### Task 3: 狀態保存與 UI 動線

**Files:**
- Modify: `index.html`
- Modify: `property-sales.js`
- Modify: `tests/property-sales.test.mjs`

- [ ] **Step 1: 寫入狀態測試**

測試預設 state 不共用陣列、資料序列化不含函式、selectedFeatures 與 generatedCopy 可完整 round-trip。

- [ ] **Step 2: 實作狀態同步**

使用 `devLetterTool.propertySales.v1` 保存物件欄位、標籤、tone、variant、輸出尺寸與已編輯文案；主照片沿用現有壓縮函式與錯誤處理。

- [ ] **Step 3: 串接三步驟導覽**

選擇模式／尺寸為 step 1，填資料／選標籤／選 tone 為 step 2，產生文案、預覽與輸出為 step 3。

- [ ] **Step 4: 執行測試並提交**

Run: `node --test tests/*.test.mjs`

Expected: 全部 PASS。

Run: `git add index.html property-sales.js tests/property-sales.test.mjs && git commit -m "feat: persist property sales workflow"`

### Task 4: A4 橫式輸出版

**Files:**
- Create: `property-sales.css`
- Modify: `property-sales.js`
- Modify: `index.html`
- Modify: `tests/property-sales.test.mjs`

- [ ] **Step 1: 寫入 A4 builder 失敗測試**

檢查 `buildA4HTML()` 產出 `.property-a4`、主照片、價格、規格、最多五項特色、業務資訊、QR 區與經紀證號；所有使用者文字必須 escape。

- [ ] **Step 2: 實作 A4 builder 與樣式**

畫布 297 × 210 mm，左側照片約 55%，右側資訊約 45%。四種主題透過既有 `theme-*` class 套色；列印時每張一頁。

- [ ] **Step 3: 串接預覽與列印**

房屋銷售模式的 `renderPreview()` 顯示 A4 builder；`printBtn` 驗證必要欄位後寫入 `printArea`，沿用既有 `window.print()`。

- [ ] **Step 4: 執行測試並提交**

Run: `node --test tests/*.test.mjs`

Expected: 全部 PASS。

Run: `git add property-sales.css property-sales.js index.html tests/property-sales.test.mjs && git commit -m "feat: add A4 property sales layout"`

### Task 5: 16:9 社群輸出版

**Files:**
- Modify: `property-sales.css`
- Modify: `property-sales.js`
- Modify: `index.html`
- Modify: `tests/property-sales.test.mjs`

- [ ] **Step 1: 寫入 16:9 builder 失敗測試**

檢查 `buildSocialHTML()` 產出 `.property-social`、1600 × 900 view、三項核心特色、價格與 CTA，且不直接嵌入 A4 markup。

- [ ] **Step 2: 實作社群 builder 與樣式**

建立獨立 16:9 排版，保留同一份 property state 與四種主題色。文字量限制為標題、價格、三項特色與精簡 CTA。

- [ ] **Step 3: 串接尺寸切換與圖片輸出**

尺寸按鈕切換 A4／16:9 預覽。新增「下載社群圖片」按鈕；使用現有前端環境可支援的 canvas 截圖方式，失敗時顯示可操作錯誤，不影響 PDF 列印。

- [ ] **Step 4: 執行測試並提交**

Run: `node --test tests/*.test.mjs`

Expected: 全部 PASS。

Run: `git add property-sales.css property-sales.js index.html tests/property-sales.test.mjs && git commit -m "feat: add social property sales layout"`

### Task 6: 完整回歸與可用性檢查

**Files:**
- Verify: `index.html`
- Verify: `property-sales.js`
- Verify: `property-sales.css`
- Verify: `tests/*.test.mjs`

- [ ] **Step 1: 執行全部測試**

Run: `node --test tests/*.test.mjs`

Expected: 0 failures。

- [ ] **Step 2: 檢查語法與差異**

Run: `git diff --check`

Expected: 無 whitespace errors。

確認既有 13 個開發信模板、`buildLetterHTML()`、`buildFlyerHTML()`、Email endpoint、GA4 ID、四種主題按鈕與既有 storage key 均未移除。

- [ ] **Step 3: 瀏覽器實機檢查**

以 375px、768px、1440px 檢查表單、標籤複選、四種 tone、兩種尺寸、列印預覽與既有兩種模式。若 wmux 未啟動，明確記錄為交付前待驗項，禁止假稱已驗證。

- [ ] **Step 4: 建立交付摘要**

列出新增功能、測試數量、未部署狀態與正式 repo 同步步驟；未經 Sally 指示不 push。
