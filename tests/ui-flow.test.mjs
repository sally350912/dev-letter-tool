import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(here, '..', 'index.html'), 'utf8');

test('keeps email unlock as the entry gate with an accessible field', () => {
  assert.match(html, /id="emailGate"[^>]+aria-modal="true"/);
  assert.match(html, /<label[^>]+for="emailGateInput"/);
  assert.match(html, /id="emailGateInput"[^>]+type="email"/);
  assert.match(html, /devLetterTool\.unlocked/);
});

test('provides a three-step workflow after unlock', () => {
  assert.match(html, /id="workflowStepper"/);
  assert.match(html, /data-workflow-step="1"/);
  assert.match(html, /data-workflow-step="2"/);
  assert.match(html, /data-workflow-step="3"/);
  assert.match(html, /function setWorkflowStep\(step\)/);
});

test('includes search and social sharing metadata', () => {
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/dev-letter-tool\.vercel\.app\/"/);
  assert.match(html, /<meta property="og:title" content="[^"]+"/);
  assert.match(html, /<meta property="og:description" content="[^"]+"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
});

test('preserves all output themes and builders', () => {
  for (const theme of ['navy', 'emerald', 'wine', 'gold']) {
    assert.match(html, new RegExp(`data-theme="${theme}"`));
  }
  assert.match(html, /function buildLetterHTML\(template, recipient, letterIndex\)/);
  assert.match(html, /function buildFlyerHTML\(\)/);
  assert.equal((html.match(/key:'(?:general|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)'/g) || []).length, 13);
});

test('personalizes letters with recipient road segments', () => {
  assert.match(html, /road: parts\[1\]\|\|''/);
  assert.doesNotMatch(html, /致 \$\{escHTML\(recipient\.road\)\} 的屋主/);
  assert.match(html, /recipient\?\.road \|\| state\.agent\.serviceRegion/);
  assert.match(html, /recipient\?\.road \|\| ''\) \|\| region/);
});

test('supports buyer story fields in the urgent panel', () => {
  assert.match(html, /id="buyerBudget"/);
  assert.match(html, /id="buyerTiming"/);
  assert.match(html, /買方預算/);
  assert.match(html, /看屋時間/);
});

test('rotates letter openers to avoid identical mailbox drops', () => {
  assert.match(html, /const LETTER_OPENERS = \[/);
  assert.match(html, /id="rotateOpeners"[^>]+checked/);
  assert.match(html, /LETTER_OPENERS\[idx % LETTER_OPENERS\.length\]/);
});

test('offers flyer PNG download and settings export/import', () => {
  assert.match(html, /id="downloadFlyerImage"/);
  assert.match(html, /id="exportSettings"/);
  assert.match(html, /id="importSettings"/);
  assert.match(html, /id="importSettingsFile"[^>]+type="file"/);
});

test('phone output: fit-width preview, share image, recipient picker', () => {
  assert.match(html, /function fitPreview\(\)/);
  assert.match(html, /id="shareImageBtn"/);
  assert.match(html, /id="zoomToggle"/);
  assert.match(html, /id="recipientPicker"/);
  assert.match(html, /navigator\.canShare\(\{ files:\[file\] \}\)/);
  assert.match(html, /track\('share_image'/);
  assert.match(html, /track\('save_image'/);
  // 舊的寫死 zoom 比例不能回來（會讓手機預覽縮到 0.23 倍看不清）
  assert.doesNotMatch(html, /zoom:\s*\.(23|32|36|46|48)\b/);
});

test('keeps existing persistence and analytics identifiers', () => {
  assert.match(html, /G-YSC1Q52B7G/);
  assert.match(html, /devLetterTool\.agent\.v4/);
  assert.match(html, /const UNLOCK_KEY = 'devLetterTool\.unlocked'/);
});

test('all inline scripts have valid JavaScript syntax', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1])
    .filter(Boolean);
  assert.ok(scripts.length >= 3);
  scripts.forEach(script => assert.doesNotThrow(() => new Function(script)));
});

test('provides the property sales editor workflow', () => {
  assert.match(html, /<script src="property-sales\.js"><\/script>/);
  assert.match(html, /data-output-card="dm-property"/);
  for (const id of ['propertyTitle','propertyArea','propertyPrice','propertySize','propertyRooms','propertyPhotoFile']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /id="propertyFeatureGroups"/);
  for (const tone of ['friendly','professional','playful','direct']) {
    assert.match(html, new RegExp(`data-property-tone="${tone}"`));
  }
  for (const field of ['propertyCopyHeadline','propertyCopyOpening','propertyCopySellingPoints','propertyCopyCta']) {
    assert.match(html, new RegExp(`id="${field}"`));
  }
  assert.match(html, /data-property-size="a4"/);
  assert.match(html, /data-property-size="social"/);
});

test('compresses large property photos instead of rejecting common phone files', () => {
  assert.match(html, /function compressPropertyImage\(file/);
  const propertyUpload = html.slice(html.indexOf("propertyPhotoFile').addEventListener"), html.indexOf("propertyPhotoFile').addEventListener") + 1800);
  assert.doesNotMatch(propertyUpload, /file\.size>800\*1024/);
  assert.match(propertyUpload, /15\*1024\*1024/);
});

test('offers copy script and DM outputs through step-2 cards', () => {
  assert.match(html, /data-output-card="copy"/);
  assert.match(html, /data-output-card="dm-letter"/);
  assert.match(html, /data-output-card="dm-flyer"/);
  assert.match(html, /data-output-card="dm-property"/);
  assert.match(html, /id="propertyDmEyebrow"/);
  assert.match(html, /文案腳本/);
  assert.match(html, /data-copy-script="fb"|SCRIPT_PLATFORMS/);
  assert.match(html, /PropertySales\.buildScripts/);
});

test('uses a four-step wizard with shared basic profile', () => {
  assert.match(html, /data-workflow-step="4"/);
  assert.match(html, /id="stepPanel1"/);
  assert.match(html, /id="stepPanel2"/);
  assert.match(html, /id="stepPanel3"/);
  assert.match(html, /data-step-next="2"/);
  assert.match(html, /data-step-prev="3"/);
  assert.match(html, /function setOutput\(/);
  assert.match(html, /function currentOutputKey\(/);
});
