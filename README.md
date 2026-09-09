# 🚀 دليل تشغيل صفحة الهبوط (خطوة بخطوة)

## 1️⃣ تعديل إعداداتك (مهم جداً)

افتح الملف `js/data.js` وعدّل:
- `WHATSAPP_NUMBER`: ضع رقم واتسابك بالصيغة الدولية بدون + (مثال: `213550123456`)
- `SHEET_WEBHOOK_URL`: ستحصل عليه من الخطوة 3

## 2️⃣ النشر على Netlify (مجاناً)

### الطريقة الأسهل (Netlify Drop):
1. افتح: https://app.netlify.com/drop
2. اسحب مجلد `landing-page` كاملاً وأفلته في الصفحة
3. احصل على رابط مثل: `https://اسم-متجرك.netlify.app` ✅

## 3️⃣ ربط الطلبات بـ Google Sheets

1. افتح Google Sheets جديداً (سطر العناوين):
   `الاسم | الهاتف | الولاية | البلدية | العرض | التاريخ`
2. من القائمة: **الإضافات (Extensions) ← Apps Script**
3. امسح أي كود وضع هذا:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([data.nom, data.phone, data.wilaya, data.commune, data.offer, data.date]);
  return ContentService.createTextOutput('OK');
}
```

4. اضغط **نشر (Deploy) ← نشر جديد ← تطبيق ويب**
   - نفذ كـ: **أنا (Me)**
   - من يمكنه الوصول: **أي شخص (Anyone)**
5. انسخ رابط الـ Web App والصقه في `SHEET_WEBHOOK_URL` داخل `js/data.js`
6. أعد رفع الملف على Netlify

✅ الآن كل طلب يظهر تلقائياً في الشيت + رسالة واتساب تفتح عند العميل/لك.

## 4️⃣ زر الإرسال إلى يليدين (Yalidine)

في الشيت: **الإضافات ← Apps Script** وأضف هذا الكود:

```javascript
function envoyerVersYalidine() {
  const API_ID = 'ضع_API_ID_هنا';
  const API_TOKEN = 'ضع_API_TOKEN_هنا';
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  if (row < 2) return;

  const parcel = {
    order_id: 'CMD-' + Date.now(),
    firstname: sheet.getRange(row, 1).getValue(),
    phone: sheet.getRange(row, 2).getValue(),
    wilaya_name: sheet.getRange(row, 3).getValue(),
    commune_name: sheet.getRange(row, 4).getValue(),
    product_list: sheet.getRange(row, 5).getValue(),
    price: parseInt(sheet.getRange(row, 5).getValue().match(/\d+/)) || 0,
    do_payment: true
  };

  const res = UrlFetchApp.fetch('https://api.yalidine.com/v1/parcels/', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-API-ID': API_ID, 'X-API-TOKEN': API_TOKEN },
    payload: JSON.stringify([parcel])
  });

  const tracking = JSON.parse(res.getContentText()).data[0].tracking;
  sheet.getRange(row, 7).setValue(tracking); // عمود رقم 7 = رقم التتبع
}
```

ثم: **الإضافات ← Macros ← إدارة** واربط الدالة بزر، أو شغلها من محرر Apps Script.

🔑 مفاتيح يليدين: من لوحة تحكم يليدين ← إعدادات API.

## 5️⃣ تخصيص الصفحة

| ماذا تعدّل | أين |
|---|---|
| اسم المنتج والوصف | `index.html` (قسم hero و features) |
| الأسعار والعروض | `index.html` (قسم offers) |
| آراء الزبائن | `index.html` (قسم reviews) |
| الصورة الرئيسية | استبدل `🧴` في `div.hero-img` بوسم `<img>` لصورتك |
| البلديات | `js/data.js` (كائن COMMUNES) |
