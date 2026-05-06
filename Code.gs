/**
 * 房仲開發信批次生產工具 — Email Gate 後端
 * 部署：Apps Script → 部署 → 新增部署作業 → 類型「網頁應用程式」
 *      執行身分：我（你的 Gmail）
 *      存取權限：所有人
 *      取得 Web App URL，貼回 index.html 的 EMAIL_GATE_ENDPOINT
 *
 * 流程：
 *  使用者填 Email → 前端 POST → 檢查 Sheet 是否重複
 *    重複 → 回 { status:"duplicate" }
 *    新使用者 → 寫 Sheet + 寄歡迎信 + 回 { status:"ok" }
 */

// ===== 設定區（部署前請改） =====
const SHEET_ID    = '1ZFZwDOj-qZD7LYl4bDzFiiR9bfbP9cVktwfX8wZI63g';
const SHEET_NAME  = '名單';                          // 工作表分頁名
const TOOL_URL    = 'https://dev-letter-tool.vercel.app/';
const FROM_NAME   = '莎莉｜台東女子北漂中';
const SUBJECT     = '你的試用資格已解鎖 🔓｜莎莉 Sally';
// =================================

function doPost(e) {
  try {
    const body  = JSON.parse(e.postData.contents || '{}');
    const email = String(body.email || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return jsonOut({ status: 'error', message: 'Email 格式不正確' });
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
               || SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);

    // 第一次使用：補表頭
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['時間', 'Email', '來源', 'User-Agent']);
    }

    // 取出 Email 欄（B）做重複檢查
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues()
                          .flat().map(v => String(v).trim().toLowerCase());
      if (emails.indexOf(email) !== -1) {
        return jsonOut({
          status: 'duplicate',
          message: '這個 Email 已經領取過囉，請直接使用工具 ✨'
        });
      }
    }

    // 寫入 Sheet
    sheet.appendRow([
      new Date(),
      email,
      body.source || 'web',
      body.ua || ''
    ]);

    // 寄歡迎信
    sendWelcomeMail(email);

    return jsonOut({
      status: 'ok',
      message: '歡迎信已寄出，請至信箱查收（含垃圾信件夾）'
    });

  } catch (err) {
    return jsonOut({ status: 'error', message: String(err) });
  }
}

function doGet() {
  return jsonOut({ status: 'ok', message: 'dev-letter-tool email gate alive' });
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendWelcomeMail(to) {
  const html = `
<div style="font-family:'Noto Sans TC',Arial,sans-serif;background:#EDE0D4;padding:32px 16px;color:#3a2a1f">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #C4783A;border-radius:14px;overflow:hidden">
    <div style="background:#7A5C4A;color:#fff;padding:22px 28px">
      <div style="font-size:12px;letter-spacing:.22em;color:#E8C96A">SALLY · LIFESTYLE</div>
      <div style="font-family:'Noto Serif TC',serif;font-size:22px;font-weight:700;margin-top:6px;letter-spacing:.04em">
        你的試用資格已解鎖 🔓
      </div>
    </div>
    <div style="padding:26px 28px;line-height:1.95;font-size:15px">
      <p style="margin:0 0 14px">嗨！</p>
      <p style="margin:0 0 14px">你已經成功解鎖「<b style="color:#C4783A">房仲 AI 開發信工具</b>」的試用資格了 🎉</p>
      <p style="margin:0 0 4px">這個工具是我當房仲時，每天重複寫開發信寫到崩潰，</p>
      <p style="margin:0 0 14px">後來自己做出來的東西，希望對你有幫助 😊</p>

      <p style="margin:24px 0;text-align:center">
        <a href="${TOOL_URL}" style="display:inline-block;background:#C4783A;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:99px;letter-spacing:.05em">立即進入工具 →</a>
      </p>

      <div style="border-top:1px dashed #d8c5b1;margin:22px 0"></div>

      <p style="margin:0 0 14px">目前工具還在持續開發中，之後會陸續新增更多功能。</p>
      <p style="margin:0 0 4px">你的 Email 已經在名單裡了，</p>
      <p style="margin:0 0 4px">每次有新工具或新功能上線，</p>
      <p style="margin:0 0 14px">你都會是第一個收到通知的人 🎯</p>

      <div style="border-top:1px dashed #d8c5b1;margin:22px 0"></div>

      <p style="margin:0 0 4px">有任何使用問題或想法，</p>
      <p style="margin:0 0 14px">直接回覆這封信告訴我，我都會看！</p>

      <div style="margin-top:28px;padding-top:20px;border-top:2px solid #EDE0D4">
        <p style="font-family:'Noto Serif TC',serif;font-style:italic;color:#7A5C4A;margin:0 0 18px;font-size:15px;letter-spacing:.04em">還在成長的你，我陪你一起走 🌱</p>
        <p style="margin:0;font-size:14px;line-height:2">
          <b style="color:#C4783A;font-size:15px">莎莉 Sally</b><br>
          <span style="color:#7A5C4A">台東女子｜北漂中</span><br>
          <span style="color:#7A5C4A">用 AI 讓工作變簡單 ⚡</span>
        </p>
        <p style="margin:16px 0 0;font-size:13px;line-height:2;color:#7A5C4A">
          📷 IG：<a href="https://www.instagram.com/sally.lifestyle.ttt" style="color:#C4783A;text-decoration:none;font-weight:600">@sally.lifestyle.ttt</a><br>
          🧵 Threads：<a href="https://www.threads.com/@sally.lifestyle.ttt" style="color:#C4783A;text-decoration:none;font-weight:600">@sally.lifestyle.ttt</a>
        </p>
      </div>
    </div>
  </div>
  <div style="text-align:center;font-size:11px;color:#9b8470;margin-top:14px">
    這封信由 dev-letter-tool 自動寄出，每個 Email 只會收到一次。
  </div>
</div>`;

  MailApp.sendEmail({
    to: to,
    subject: SUBJECT,
    htmlBody: html,
    name: FROM_NAME
  });
}

// 一鍵測試（在 Apps Script 編輯器裡跑）
function _test() {
  const fake = { postData: { contents: JSON.stringify({ email: 'test@example.com' }) } };
  Logger.log(doPost(fake).getContent());
}
