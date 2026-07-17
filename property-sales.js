(function(root){
  'use strict';

  const STORAGE_KEY = 'devLetterTool.propertySales.v1';

  const FEATURE_GROUPS = {
    light: { label:'採光', items:['明亮採光','雙面採光','自然通風','日照充足','室內通透'] },
    layout: { label:'格局', items:['格局方正','動線順暢','空間好規劃','房間皆有窗','收納充足'] },
    location: { label:'地段', items:['核心地段','靜巷住宅','交通便利','近捷運','通勤省時'] },
    lifestyle: { label:'生活機能', items:['採買方便','學區完整','近公園','餐飲選擇多','日常機能齊全'] },
    view: { label:'景觀', items:['高樓視野','棟距舒適','綠意景觀','城市景觀','永久棟距'] },
    condition: { label:'屋況', items:['屋況良好','精緻裝潢','可直接入住','全新整理','保養用心'] }
  };

  const TONES = {
    friendly: { label:'親切陪伴型', description:'溫暖生活化，像陪客戶一起找家' },
    professional: { label:'專業顧問型', description:'條件清楚，強調區位與適合族群' },
    playful: { label:'活潑有趣型', description:'節奏輕快，有記憶點但不浮誇' },
    direct: { label:'俐落成交型', description:'核心資訊先講，直接引導預約' }
  };

  const REQUIRED_FIELDS = ['title','area','price','size','rooms','photoDataUrl'];

  const sentenceSets = {
    friendly: {
      headlines: [
        p=>`${p.area}｜一間讓日常住得舒服的 ${p.rooms}`,
        p=>`想把生活過得更從容？來看看 ${p.title}`,
        p=>`${p.title}，一間會讓人想早點回家的房子`,
        p=>`在 ${p.area} 找家的你，這間 ${p.rooms} 值得排進清單`
      ],
      openings: [
        p=>`如果你正在找一個交通、空間與生活感都能兼顧的家，${p.title} 很適合排進看屋清單。`,
        p=>`${p.title} 把實用條件和舒服的居住感放在一起，適合想好好安頓日常的你。`,
        p=>`看了很多間還是沒有心動的感覺？${p.title} 或許就是你在等的那一間。`,
        p=>`房子不只是坪數和價格，${p.title} 住起來的樣子，想帶你親自看一次。`
      ],
      ctas: [
        a=>`想親自感受空間，歡迎找 ${a.agentName||'我'} 安排賞屋${contact(a)}。`,
        a=>`有任何購屋問題都可以先聊聊，${a.agentName||'我'} 會陪你一起確認${contact(a)}。`,
        a=>`週末剛好有空？跟 ${a.agentName||'我'} 約個時間，現場走一圈最有感${contact(a)}。`,
        a=>`先不用急著決定，來看過再說。找 ${a.agentName||'我'} 排時間就好${contact(a)}。`
      ]
    },
    professional: {
      headlines: [
        p=>`${p.area} ${p.rooms}｜${p.size}｜總價 ${p.price}`,
        p=>`${p.title}｜區位、格局與生活機能一次掌握`,
        p=>`${p.area} 指標物件｜${p.title}`,
        p=>`${p.title}｜${p.size}・${p.rooms}・條件完整釋出`
      ],
      openings: [
        p=>`本案位於 ${p.area}，規劃 ${p.rooms}、室內條件完整，適合重視通勤效率與空間使用的購屋族。`,
        p=>`${p.title} 具備清楚的產品定位與生活圈優勢，建議自住與換屋族安排現場評估。`,
        p=>`${p.area} 近期釋出物件中，${p.title} 的格局規劃與總價帶相對到位，值得優先評估。`,
        p=>`就區位、屋況與價格三個面向來看，${p.title} 在同生活圈的競爭力明確，建議實地比較。`
      ],
      ctas: [
        a=>`預約賞屋或索取完整物件資料，請洽 ${a.agentName||'服務專員'}${contact(a)}。`,
        a=>`歡迎聯繫 ${a.agentName||'服務專員'}，確認可看屋時段與物件細節${contact(a)}。`,
        a=>`需要同生活圈的成交行情比較表，可向 ${a.agentName||'服務專員'} 索取${contact(a)}。`,
        a=>`本案可約平日晚間與週末帶看，請洽 ${a.agentName||'服務專員'} 安排${contact(a)}。`
      ]
    },
    playful: {
      headlines: [
        p=>`${p.area} 好宅登場：${p.rooms} 的生活剛剛好`,
        p=>`採光、空間、地點都到位｜${p.title}`,
        p=>`欸，${p.area} 這間你看過了嗎？`,
        p=>`${p.title}｜看房看到累的人，先看這間`
      ],
      openings: [
        p=>`找房像配對，條件對了還要住起來有感。${p.title}，就是會讓人想多看兩眼的那一間。`,
        p=>`不繞路，先看重點：${p.title} 有好用的空間，也有能把日常過順的生活圈。`,
        p=>`滑了一百間房子還是沒感覺？停，先看 ${p.title}，它跟你想的不太一樣。`,
        p=>`${p.title} 的優點不用形容詞堆出來，列給你看，自己判斷。`
      ],
      ctas: [
        a=>`照片看完還不夠，直接約現場最準。找 ${a.agentName||'我'} 排時間${contact(a)}。`,
        a=>`想看看它和你合不合拍？私訊 ${a.agentName||'我'}，一起去看房${contact(a)}。`,
        a=>`好房子不等人，這句是老話但是真的。敲 ${a.agentName||'我'} 約看屋${contact(a)}。`,
        a=>`與其在照片前糾結，不如來現場十分鐘。${a.agentName||'我'} 等你敲${contact(a)}。`
      ]
    },
    direct: {
      headlines: [
        p=>`${p.title}｜${p.price}｜預約看屋`,
        p=>`${p.area} ${p.rooms} 銷售中｜總價 ${p.price}`,
        p=>`${p.title}｜${p.size}｜${p.price}｜可約看`,
        p=>`${p.area} 釋出｜${p.rooms}・${p.price}`
      ],
      openings: [
        p=>`${p.title}，${p.size}、${p.rooms}，總價 ${p.price}。核心資訊一次看清楚。`,
        p=>`鎖定 ${p.area} 的買方請留意：${p.title} 現正銷售中。`,
        p=>`${p.area} 買方注意，${p.title} 條件如下，適合直接約看。`,
        p=>`不多說，${p.title} 重點資訊列在下面，有需求直接聯繫。`
      ],
      ctas: [
        a=>`立即預約賞屋：${a.agentName||'服務專員'}${contact(a)}。`,
        a=>`索取地址與完整資料，請直接聯繫 ${a.agentName||'服務專員'}${contact(a)}。`,
        a=>`看屋時段有限，請提前與 ${a.agentName||'服務專員'} 預約${contact(a)}。`,
        a=>`今天就能約，聯繫 ${a.agentName||'服務專員'} 確認時段${contact(a)}。`
      ]
    }
  };

  function contact(agent){
    const parts = [];
    if(agent.phone) parts.push(`電話 ${agent.phone}`);
    if(agent.lineId) parts.push(`LINE ${agent.lineId}`);
    return parts.length ? `（${parts.join('｜')}）` : '';
  }

  function createDefaultState(){
    return {
      property:{ title:'',area:'',price:'',size:'',rooms:'',floor:'',age:'',parking:'',fee:'',listingId:'',notes:'',photoDataUrl:'' },
      selectedFeatures:[], customFeature:'', tone:'friendly', variant:0, outputType:'copy', outputSize:'a4', dmEyebrow:'本月精選物件',
      generatedCopy:{ headline:'',opening:'',sellingPoints:'',cta:'' }, copyEdited:false
    };
  }

  function validateProperty(property, options){
    const source = property || {};
    // 文案腳本純文字輸出用不到照片，requirePhoto:false 時跳過；DM 版面仍必須有照片
    const required = (options && options.requirePhoto === false)
      ? REQUIRED_FIELDS.filter(key=>key!=='photoDataUrl')
      : REQUIRED_FIELDS;
    const missing = required.filter(key=>!String(source[key]||'').trim());
    return { valid:missing.length===0, missing };
  }

  function generateCopy(input){
    const property = input.property || {};
    const tone = sentenceSets[input.tone] ? input.tone : 'friendly';
    const variant = Math.abs(Number(input.variant)||0);
    const set = sentenceSets[tone];
    const features = [...(input.selectedFeatures||[])];
    if(String(input.customFeature||'').trim()) features.push(String(input.customFeature).trim());
    const headline = set.headlines[variant % set.headlines.length](property);
    const opening = set.openings[variant % set.openings.length](property);
    const featureText = features.length
      ? `${features.map((item,index)=>index===features.length-1 && index>0 ? `以及${item}` : item).join('、')}，讓空間條件與生活便利都能兼顧。`
      : '物件條件完整，歡迎安排現場了解空間與周邊環境。';
    return { headline, opening, sellingPoints:featureText, cta:set.ctas[variant % set.ctas.length](input.agent||{}) };
  }

  // 完整文案腳本產生器：把四段文案＋物件規格＋聯絡資訊組成可直接發布的三平台版本
  function buildScripts(input){
    const p = input.property || {};
    const copy = input.generatedCopy || {};
    const agent = input.agent || {};
    const specs = [
      p.area?`📍 地段｜${p.area}`:'',
      p.price?`💰 總價｜${p.price}`:'',
      p.size?`📐 坪數｜${p.size}`:'',
      p.rooms?`🛏 格局｜${p.rooms}`:'',
      p.floor?`🏢 樓層｜${p.floor}`:'',
      p.age?`🗓 屋齡｜${p.age}`:'',
      p.parking?`🚗 車位｜${p.parking}`:'',
      p.fee?`🧾 管理費｜${p.fee}`:'',
      p.listingId?`🔖 物件編號｜${p.listingId}`:''
    ].filter(Boolean);
    const contactLines = [
      agent.agentName?`👤 ${agent.agentName}${agent.storeName?`｜${agent.storeName}`:''}`:'',
      agent.phone?`📞 ${agent.phone}`:'',
      agent.lineId?`💬 LINE：${agent.lineId}`:'',
      agent.licenseNo?`🪪 經紀證號：${agent.licenseNo}`:''
    ].filter(Boolean);
    const features = [...(input.selectedFeatures||[])];
    if(String(input.customFeature||'').trim()) features.push(String(input.customFeature).trim());
    const tags = [...new Set([p.area, p.rooms, ...features.slice(0,4), '買房', '賞屋'])]
      .filter(Boolean)
      .map(tag=>'#'+String(tag).replace(/\s+/g,''));
    const notesLine = String(p.notes||'').trim() ? `📌 ${String(p.notes).trim()}` : '';
    return {
      fb: [copy.headline, copy.opening, copy.sellingPoints, specs.join('\n'), notesLine, copy.cta, contactLines.join('\n')]
        .filter(Boolean).join('\n\n'),
      ig: [copy.headline, copy.opening, specs.slice(0,5).join('\n'), copy.cta, tags.join(' ')]
        .filter(Boolean).join('\n\n'),
      line: [copy.headline?`🏠 ${copy.headline}`:'', specs.join('\n'), notesLine, copy.cta, contactLines.slice(0,3).join('\n')]
        .filter(Boolean).join('\n\n')
    };
  }

  function escapeHTML(value){
    return String(value==null?'':value)
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }

  function normalizeState(saved){
    const base = createDefaultState();
    const source = saved && typeof saved === 'object' ? saved : {};
    const property = source.property && typeof source.property === 'object' ? source.property : {};
    base.property = { ...base.property };
    Object.keys(base.property).forEach(key=>{
      if(typeof property[key] === 'string') base.property[key] = property[key];
    });
    base.selectedFeatures = Array.isArray(source.selectedFeatures)
      ? source.selectedFeatures.filter(item=>typeof item === 'string').slice(0,12)
      : [];
    base.customFeature = typeof source.customFeature === 'string' ? source.customFeature : '';
    base.tone = TONES[source.tone] ? source.tone : 'friendly';
    base.variant = Number.isFinite(Number(source.variant)) ? Math.max(0,Math.floor(Number(source.variant))) : 0;
    base.outputSize = source.outputSize === 'social' ? 'social' : 'a4';
    base.outputType = source.outputType === 'dm' ? 'dm' : 'copy';
    base.dmEyebrow = typeof source.dmEyebrow === 'string' && source.dmEyebrow.trim() ? source.dmEyebrow.slice(0,18) : '本月精選物件';
    if(source.generatedCopy && typeof source.generatedCopy === 'object'){
      Object.keys(base.generatedCopy).forEach(key=>{
        if(typeof source.generatedCopy[key] === 'string') base.generatedCopy[key] = source.generatedCopy[key];
      });
    }
    base.copyEdited = source.copyEdited === true;
    return base;
  }

  function serializeState(state){
    return JSON.stringify(normalizeState(state));
  }

  function safeImage(value){
    return /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(String(value||'')) ? String(value) : '';
  }

  function getScaledDimensions(width,height,maxDimension){
    const w=Math.max(1,Number(width)||1);
    const h=Math.max(1,Number(height)||1);
    const max=Math.max(1,Number(maxDimension)||2000);
    const scale=Math.min(1,max/Math.max(w,h));
    return { width:Math.round(w*scale),height:Math.round(h*scale) };
  }

  function buildA4HTML(input){
    const property = input.property || {};
    const copy = input.generatedCopy || {};
    const agent = input.agent || {};
    const theme = ['navy','emerald','wine','gold'].includes(input.theme) ? input.theme : 'navy';
    const features = [property.size,property.rooms,property.floor,property.area].filter(Boolean).slice(0,4);
    const photo = safeImage(property.photoDataUrl);
    const logo = safeImage(agent.logoDataUrl);
    const portrait = safeImage(agent.photoDataUrl);
    const qr = safeImage(agent.customQrDataUrl);
    return `<article class="property-a4 theme-${theme}">
      <section class="property-a4-photo" style="${photo?`background-image:url('${photo}')`:''}">
        ${!photo?'<div class="property-photo-empty">請上傳物件主照片</div>':''}
        <div class="property-photo-shade"></div>
        <div class="property-photo-top">${logo?`<img src="${logo}" alt="">`:`<span>${escapeHTML(agent.storeName||'房屋銷售')}</span>`}</div>
        <div class="property-photo-caption"><span>${escapeHTML(input.dmEyebrow||'本月精選物件')}</span><strong>${escapeHTML((property.title||'精選好宅').slice(0,22))}</strong></div>
      </section>
      <section class="property-a4-content">
        <div class="property-a4-eyebrow">${escapeHTML(input.dmEyebrow||'本月精選物件')}</div>
        <h1>${escapeHTML((property.title||copy.headline||'精選好宅').slice(0,22))}</h1>
        <div class="property-a4-price"><small>總價</small><strong>${escapeHTML(property.price||'價格洽詢')}</strong></div>
        <div class="property-facts">${features.map(item=>`<span>${escapeHTML(item)}</span>`).join('')}</div>
        <div class="property-a4-contact">
          <div class="property-agent-photo">${portrait?`<img src="${portrait}" alt="">`:'<span>業務</span>'}</div>
          <div class="property-agent-info"><strong>${escapeHTML(agent.agentName||'服務專員')}</strong><span>${escapeHTML(agent.phone||'')}</span><span>${escapeHTML(agent.lineId?`LINE ${agent.lineId}`:'')}</span></div>
          <p>賞屋請找 ${escapeHTML(agent.agentName||'服務專員')}</p>
          <div class="property-qr">${qr?`<img src="${qr}" alt="聯絡 QR Code">`:'<span>掃碼<br>聯繫</span>'}</div>
        </div>
        <div class="property-a4-legal">${property.listingId?`物件編號 ${escapeHTML(property.listingId)}　`:''}${agent.licenseNo?`經紀證號 ${escapeHTML(agent.licenseNo)}`:''}</div>
      </section>
    </article>`;
  }

  function buildSocialHTML(input){
    const property=input.property||{};
    const copy=input.generatedCopy||{};
    const agent=input.agent||{};
    const theme=['navy','emerald','wine','gold'].includes(input.theme)?input.theme:'navy';
    const features=[property.size,property.rooms,property.floor,property.area].filter(Boolean).slice(0,4);
    const photo=safeImage(property.photoDataUrl);
    const logo=safeImage(agent.logoDataUrl);
    const portrait=safeImage(agent.photoDataUrl);
    return `<article class="property-social theme-${theme}" data-canvas-width="1200" data-canvas-height="900">
      <div class="property-social-photo" style="${photo?`background-image:url('${photo}')`:''}"></div>
      <div class="property-social-gradient"></div>
      <div class="property-social-brand">${logo?`<img src="${logo}" alt="">`:escapeHTML(agent.storeName||'精選房屋')}</div>
      <div class="property-social-copy">
        <span class="property-social-area">${escapeHTML(input.dmEyebrow||'本月精選物件')}</span>
        <h1>${escapeHTML((property.title||copy.headline||'精選好宅').slice(0,22))}</h1>
        <div class="property-social-price"><small>總價</small>${escapeHTML(property.price||'價格洽詢')}</div>
        <div class="property-social-features">${features.map(item=>`<span>${escapeHTML(item)}</span>`).join('')}</div>
      </div>
      <div class="property-social-contact">
        ${portrait?`<img src="${portrait}" alt="">`:''}
        <div><strong>賞屋請找　${escapeHTML(agent.agentName||'服務專員')}</strong><span>${escapeHTML(agent.storeName||'')}</span></div>
        <p>${escapeHTML([agent.phone,agent.lineId?`LINE ${agent.lineId}`:''].filter(Boolean).join(' · '))}</p>
      </div>
    </article>`;
  }

  const api = { STORAGE_KEY, FEATURE_GROUPS, TONES, REQUIRED_FIELDS, createDefaultState, validateProperty, generateCopy, buildScripts, escapeHTML, normalizeState, serializeState, getScaledDimensions, buildA4HTML, buildSocialHTML };
  root.PropertySales = api;
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
