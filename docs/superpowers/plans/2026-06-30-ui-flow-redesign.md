# UI Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保留進站 Email gate 與全部輸出樣板，重整解鎖後的操作順序，讓使用者依序完成選用途、填資料、預覽輸出。

**Architecture:** 延續現有單檔 `index.html` 與原生 JavaScript，新增純介面層的步驟導覽與狀態同步，不更動模板資料、輸出 HTML、Apps Script API 或 localStorage key。使用 Node 內建測試讀取 HTML，驗證必要結構與關鍵行為存在。

**Tech Stack:** HTML、Tailwind CDN、原生 CSS／JavaScript、Node.js `node:test`

---

### Task 1: 建立 UI 流程回歸檢查

**Files:**
- Create: `tests/ui-flow.test.mjs`
- Test: `tests/ui-flow.test.mjs`

- [ ] **Step 1: 寫入會失敗的結構測試**

測試讀取 `index.html`，檢查 SEO metadata、Email gate 的可見 label、三步驟導覽容器、`setWorkflowStep()`、四種 `data-theme` 與既有 `buildLetterHTML()`／`buildFlyerHTML()`。

- [ ] **Step 2: 執行測試並確認新需求尚未完成**

Run: `node --test tests/ui-flow.test.mjs`

Expected: FAIL，缺少 description、workflow stepper 或 `setWorkflowStep()`。

- [ ] **Step 3: 提交測試基線**

Run: `git add tests/ui-flow.test.mjs && git commit -m "test: define redesigned UI flow"`

### Task 2: 優化進站 Email gate

**Files:**
- Modify: `index.html:629-742`
- Test: `tests/ui-flow.test.mjs`

- [ ] **Step 1: 補上解鎖頁資訊層級**

保留 gate 阻擋行為，新增成果標籤、三項功能摘要、可見 Email label、隱私說明與一致的按鈕 loading／error／success 狀態；移除功能 icon 的 emoji，改用 inline SVG。

- [ ] **Step 2: 補上解鎖頁追蹤與焦點處理**

gate 顯示時追蹤 `email_gate_view`；解鎖成功後把焦點移到第一個模式按鈕。API URL、送出 payload 與 localStorage key 維持原值。

- [ ] **Step 3: 執行測試**

Run: `node --test tests/ui-flow.test.mjs`

Expected: gate 相關 assertions PASS；workflow assertions 仍 FAIL。

- [ ] **Step 4: 提交 Email gate 改動**

Run: `git add index.html && git commit -m "feat: improve email unlock experience"`

### Task 3: 建立解鎖後三步驟動線

**Files:**
- Modify: `index.html:745-997`
- Modify: `index.html:1212-2038`
- Test: `tests/ui-flow.test.mjs`

- [ ] **Step 1: 新增步驟導覽介面**

在 header 下方新增三個狀態：`1 選用途`、`2 填資料`、`3 預覽輸出`。桌機顯示完整名稱，手機顯示數字與短標籤；每個按鈕至少 44px 高並有 focus ring。

- [ ] **Step 2: 新增流程狀態函式**

建立 `setWorkflowStep(step)`，僅負責更新 `aria-current`、active class 與手機提示文字。模式切換設為 step 1；資料欄位 focus／input 設為 step 2；預覽導覽、複製與列印設為 step 3。

- [ ] **Step 3: 調整主要操作層級**

保留所有欄位與模式功能，強化「載入範例」入口；把複製與列印整合為預覽區主要操作列。手機版在預覽底部顯示固定操作列，但不得遮住內容。

- [ ] **Step 4: 執行測試**

Run: `node --test tests/ui-flow.test.mjs`

Expected: workflow assertions PASS，四種主題與兩種輸出 builder assertions PASS。

- [ ] **Step 5: 提交 UI 動線改動**

Run: `git add index.html && git commit -m "feat: guide users through three-step workflow"`

### Task 4: 補齊 SEO、分享資訊與無障礙名稱

**Files:**
- Modify: `index.html:3-14`
- Modify: `index.html:745-1109`
- Test: `tests/ui-flow.test.mjs`

- [ ] **Step 1: 新增搜尋與分享 metadata**

加入 description、canonical、Open Graph 與 Twitter Card；標題與描述清楚說明「房仲開發信／成交快報／批次生成」。

- [ ] **Step 2: 補齊互動元件名稱**

替四個主題色按鈕、關閉按鈕、上一封／下一封按鈕加入 `aria-label`；維持原有 `data-theme` 與事件綁定。

- [ ] **Step 3: 執行完整測試與 HTML 靜態檢查**

Run: `node --test tests/ui-flow.test.mjs`

Expected: 全部 PASS，0 failures。

Run: `git diff --check`

Expected: 無 whitespace errors。

- [ ] **Step 4: 提交 metadata 與無障礙改動**

Run: `git add index.html tests/ui-flow.test.mjs && git commit -m "feat: improve discovery and accessibility"`

### Task 5: 確認樣板與既有功能沒有變動

**Files:**
- Verify: `index.html`
- Verify: `Code.gs`

- [ ] **Step 1: 比對高風險區塊**

確認 `templates` 13 筆、`buildLetterHTML()`、`buildFlyerHTML()`、四種主題 class、Apps Script URL、GA4 ID、`STORAGE_KEY` 與 `UNLOCK_KEY` 均保留。

- [ ] **Step 2: 執行完整驗證**

Run: `node --test tests/ui-flow.test.mjs`

Expected: 全部 PASS，0 failures。

Run: `git status --short && git log -5 --oneline`

Expected: 只包含本次規格、計畫、測試與 `index.html` 改動。

- [ ] **Step 3: 建立交付摘要**

列出改動檔案、驗證結果、尚未完成的瀏覽器實機檢查，以及從工作副本同步回正式 repo 的後續步驟；未經 Sally 指示不 push。
