import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Sales = require('../property-sales.js');

const completeProperty = {
  title: '大安森林公園三房', area: '大安森林公園生活圈', price: '3,680 萬',
  size: '36 坪', rooms: '3 房 2 廳', floor: '8 樓／共 12 樓', age: '12 年',
  parking: '坡道平面', fee: '3,200 元／月', listingId: 'A1234', notes: '', photoDataUrl: 'data:image/jpeg;base64,abc'
};

test('defines six feature groups and four personality tones', () => {
  assert.equal(Object.keys(Sales.FEATURE_GROUPS).length, 6);
  assert.deepEqual(Object.keys(Sales.TONES), ['friendly', 'professional', 'playful', 'direct']);
  Object.values(Sales.FEATURE_GROUPS).forEach(group => assert.ok(group.items.length >= 5));
});

test('creates isolated default state with a dedicated storage key', () => {
  const a = Sales.createDefaultState();
  const b = Sales.createDefaultState();
  a.selectedFeatures.push('明亮採光');
  assert.deepEqual(b.selectedFeatures, []);
  assert.equal(Sales.STORAGE_KEY, 'devLetterTool.propertySales.v1');
});

test('validates required property fields', () => {
  const result = Sales.validateProperty({});
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ['title', 'area', 'price', 'size', 'rooms', 'photoDataUrl']);
  assert.equal(Sales.validateProperty(completeProperty).valid, true);
});

test('generates four editable copy sections for each tone', () => {
  for (const tone of Object.keys(Sales.TONES)) {
    const copy = Sales.generateCopy({ property: completeProperty, selectedFeatures: ['明亮採光', '格局方正', '近捷運'], customFeature: '', tone, variant: 0, agent: { agentName: 'Sally', phone: '0912-345-678', lineId: '@sally' } });
    assert.ok(copy.headline.length > 8);
    assert.ok(copy.opening.length > 15);
    assert.match(copy.sellingPoints, /明亮採光/);
    assert.match(copy.cta, /0912-345-678/);
  }
});

test('changes sentence variant without losing selected facts', () => {
  const base = { property: completeProperty, selectedFeatures: ['自然通風', '近公園'], customFeature: '邊間戶', tone: 'friendly', agent: {} };
  const first = Sales.generateCopy({ ...base, variant: 0 });
  const second = Sales.generateCopy({ ...base, variant: 1 });
  assert.notEqual(first.opening, second.opening);
  assert.match(second.sellingPoints, /邊間戶/);
});

test('escapes user supplied HTML', () => {
  assert.equal(Sales.escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
});

test('serializes and restores property sales state', () => {
  const state = Sales.createDefaultState();
  state.property = { ...completeProperty };
  state.selectedFeatures = ['明亮採光', '近捷運'];
  state.generatedCopy.headline = '自訂標題';
  state.tone = 'professional';
  const json = Sales.serializeState(state);
  assert.equal(typeof json, 'string');
  const restored = Sales.normalizeState(JSON.parse(json));
  assert.deepEqual(restored.selectedFeatures, ['明亮採光', '近捷運']);
  assert.equal(restored.generatedCopy.headline, '自訂標題');
  assert.equal(restored.tone, 'professional');
});

test('normalizes unsafe or incomplete saved state', () => {
  const restored = Sales.normalizeState({ selectedFeatures:'bad', tone:'unknown', outputSize:'huge', property:{ title:'保留標題' } });
  assert.deepEqual(restored.selectedFeatures, []);
  assert.equal(restored.tone, 'friendly');
  assert.equal(restored.outputSize, 'a4');
  assert.equal(restored.property.title, '保留標題');
  assert.equal(restored.property.price, '');
  assert.equal(restored.outputType, 'copy');
  assert.equal(restored.dmEyebrow, '本月精選物件');
});

test('builds an escaped A4 landscape sales layout', () => {
  const html = Sales.buildA4HTML({
    property:{ ...completeProperty, title:'<b>大安好宅</b>' },
    selectedFeatures:['明亮採光','格局方正','近捷運','近公園','可直接入住','第六項不顯示'],
    generatedCopy:{ headline:'專業主標',opening:'清楚開場',sellingPoints:'完整賣點',cta:'立即預約' },
    agent:{ agentName:'Sally',storeName:'好宅房屋',phone:'0912-345-678',lineId:'@sally',licenseNo:'北市經字第 123 號',logoDataUrl:'',photoDataUrl:'',customQrDataUrl:'' },
    theme:'navy'
  });
  assert.match(html, /class="property-a4 theme-navy"/);
  assert.match(html, /property-a4-photo/);
  assert.match(html, /3,680 萬/);
  assert.match(html, /Sally/);
  assert.match(html, /北市經字第 123 號/);
  assert.doesNotMatch(html, /第六項不顯示/);
  assert.doesNotMatch(html, /完整賣點|清楚開場|立即預約/);
  assert.match(html, /&lt;b&gt;大安好宅&lt;\/b&gt;/);
});

test('builds an independent 1600 by 900 social layout', () => {
  const html = Sales.buildSocialHTML({
    property:completeProperty,
    selectedFeatures:['明亮採光','格局方正','近捷運','第四項不顯示'],
    generatedCopy:{ headline:'社群主標',opening:'社群開場',sellingPoints:'社群賣點',cta:'歡迎預約' },
    agent:{ agentName:'Sally',phone:'0912-345-678',lineId:'@sally' }, theme:'emerald'
  });
  assert.match(html, /class="property-social theme-emerald"/);
  assert.match(html, /data-canvas-width="1200" data-canvas-height="900"/);
  assert.match(html, /大安森林公園三房/);
  assert.match(html, /36 坪/);
  assert.doesNotMatch(html, /第四項不顯示/);
  assert.doesNotMatch(html, /property-a4/);
  assert.doesNotMatch(html, /社群開場|社群賣點|歡迎預約/);
});

test('scales large property photos down while preserving aspect ratio', () => {
  assert.deepEqual(Sales.getScaledDimensions(4032, 3024, 2000), { width:2000, height:1500 });
  assert.deepEqual(Sales.getScaledDimensions(3024, 4032, 2000), { width:1500, height:2000 });
  assert.deepEqual(Sales.getScaledDimensions(1200, 800, 2000), { width:1200, height:800 });
});

test('builds complete ready-to-post scripts for FB, IG and LINE', () => {
  const state = Sales.createDefaultState();
  state.property = { ...completeProperty, notes: '預約制，屋主惜售' };
  state.selectedFeatures = ['明亮採光', '格局方正', '近捷運'];
  state.customFeature = '可養寵物';
  state.generatedCopy = Sales.generateCopy({ ...state, agent: { agentName: '王小明', phone: '0912-345-678', lineId: '@xiaoming' } });
  const scripts = Sales.buildScripts({ ...state, agent: { agentName: '王小明', storeName: '東森房屋', phone: '0912-345-678', lineId: '@xiaoming', licenseNo: '北市經(99)字第 12345 號' } });

  for (const key of ['fb', 'ig', 'line']) assert.ok(scripts[key].length > 50, key + ' script should be substantial');
  assert.match(scripts.fb, /💰 總價｜3,680 萬/);
  assert.match(scripts.fb, /📌 預約制，屋主惜售/);
  assert.match(scripts.fb, /👤 王小明｜東森房屋/);
  assert.match(scripts.fb, /經紀證號/);
  assert.match(scripts.ig, /#買房/);
  assert.match(scripts.ig, /#明亮採光/);
  assert.doesNotMatch(scripts.ig, /經紀證號/);
  assert.match(scripts.line, /^🏠 /);
  assert.match(scripts.line, /LINE：@xiaoming/);
});

test('script generator tolerates empty optional fields', () => {
  const state = Sales.createDefaultState();
  state.property = { ...Sales.createDefaultState().property, title: '好宅', area: '信義區', price: '2,000 萬', size: '25 坪', rooms: '2 房' };
  state.generatedCopy = Sales.generateCopy({ ...state, agent: {} });
  const scripts = Sales.buildScripts({ ...state, agent: {} });
  for (const key of ['fb', 'ig', 'line']) {
    assert.ok(scripts[key].length > 0);
    assert.doesNotMatch(scripts[key], /undefined|null/);
    assert.doesNotMatch(scripts[key], /\n{3,}/, key + ' should not contain triple blank lines');
  }
});

test('copy script generation does not require a photo', () => {
  const noPhoto = { ...completeProperty, photoDataUrl: '' };
  assert.equal(Sales.validateProperty(noPhoto).valid, false);
  assert.equal(Sales.validateProperty(noPhoto, { requirePhoto: false }).valid, true);
  assert.deepEqual(Sales.validateProperty(noPhoto).missing, ['photoDataUrl']);
});
