# Simplified Property DM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** 將房屋銷售拆成純文字文案與精簡 DM，DM 僅保留必要資訊。

**Architecture:** 延續 `property-sales.js` builder 與 `property-sales.css`，新增 outputType 與 dmEyebrow。`index.html` 負責分頁、欄位與預覽切換。

**Tech Stack:** HTML、CSS、原生 JavaScript、Node `node:test`

---

### Task 1: 狀態與字量規則
- [ ] 先寫失敗測試：outputType、dmEyebrow、22 字主標、最多 4 項規格。
- [ ] 實作 normalize、短標與規格 helper。
- [ ] 執行 `node --test tests/property-sales.test.mjs`。

### Task 2: 精簡 A4 與社群 DM
- [ ] 先更新 builder 測試，禁止完整 opening／sellingPoints／cta 出現在 DM。
- [ ] 重寫 A4 builder 為上方物件卡＋下方聯絡條。
- [ ] 重寫社群 builder 為 1200 × 900，同樣包含完整聯絡條。
- [ ] 更新 `property-sales.css`。

### Task 3: 純文字／DM 分頁
- [ ] 先更新 UI 結構測試。
- [ ] 在 `index.html` 新增 outputType 分頁與 DM 小標欄位。
- [ ] 純文字顯示句型選項；DM 顯示尺寸與精簡預覽。
- [ ] 下載 PNG 僅限社群 DM；列印使用 A4 DM。
- [ ] 執行 `node --test tests/*.test.mjs` 與 `git diff --check`。
