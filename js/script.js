// منطق صفحة الهبوط COD
document.addEventListener('DOMContentLoaded', function () {

  // 1) تعبئة قائمة الولايات
  const wilayaSelect = document.getElementById('wilaya');
  const communeSelect = document.getElementById('commune');
  WILAYAS.forEach(function (w, i) {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = (i + 1) + ' - ' + w;
    wilayaSelect.appendChild(opt);
  });

  // 2) تعبئة البلديات عند اختيار الولاية
  wilayaSelect.addEventListener('change', function () {
    communeSelect.innerHTML = '';
    const list = COMMUNES[this.value] || [];
    if (list.length === 0) {
      communeSelect.disabled = false;
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '— اكتب البلدية يدوياً —';
      communeSelect.appendChild(opt);
      communeSelect.innerHTML += '<input style="display:none">';
      // تحويلها لحقل نصي إذا لا توجد قائمة
      const input = document.createElement('input');
      input.type = 'text'; input.id = 'commune'; input.name = 'commune';
      input.placeholder = 'اكتب اسم البلدية';
      input.required = true;
      input.style.cssText = 'width:100%;padding:13px 14px;border:2px solid #e5e7eb;border-radius:12px;font-size:15px;';
      communeSelect.replaceWith(input);
      return;
    }
    communeSelect.disabled = false;
    const def = document.createElement('option');
    def.value = '';
    def.textContent = '— اختر البلدية —';
    communeSelect.appendChild(def);
    list.forEach(function (c) {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      communeSelect.appendChild(opt);
    });
  });

  // 3) اختيار العرض (تحديث السعر المعروض في الهيرو)
  const offerCards = document.querySelectorAll('.offer-card');
  offerCards.forEach(function (card) {
    card.addEventListener('click', function () {
      offerCards.forEach(function (c) { c.classList.remove('selected'); });
      this.classList.add('selected');
      this.querySelector('input').checked = true;
      document.getElementById('newPrice').textContent = this.dataset.price + ' دج';
      document.getElementById('oldPrice').textContent = this.dataset.old + ' دج';
    });
  });

  // 4) رابط واتساب في الفوتر
  document.getElementById('footerWhatsapp').href =
    'https://wa.me/' + CONFIG.WHATSAPP_NUMBER;

  // 5) إرسال النموذج
  const form = document.getElementById('orderForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nom = document.getElementById('nom').value.trim();
    const phone = document.getElementById('phone').value.trim().replace(/\s/g, '');
    const wilaya = wilayaSelect.value;
    const communeEl = document.getElementById('commune');
    const commune = communeEl.value.trim();
    const offer = document.querySelector('input[name="offer"]:checked').value;

    // التحقق من الحقول
    if (!nom || !phone || !wilaya || !commune) {
      alert('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (!/^(05|06|07)\d{8}$/.test(phone)) {
      alert('⚠️ يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0550123456)');
      return;
    }

    const order = {
      nom: nom,
      phone: phone,
      wilaya: wilaya,
      commune: commune,
      offer: offer,
      date: new Date().toLocaleString('ar-DZ')
    };

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ جارٍ الإرسال...';

    // (أ) إرسال إلى Google Sheets عبر Apps Script Webhook
    const sheetPromise = CONFIG.SHEET_WEBHOOK_URL
      ? fetch(CONFIG.SHEET_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(order)
        }).catch(function () {})
      : Promise.resolve();

    // (ب) فتح واتساب برسالة الطلب
    const msg =
      '🛒 *طلب جديد من الموقع*\n' +
      '━━━━━━━━━━━━━━\n' +
      '👤 الاسم: ' + order.nom + '\n' +
      '📞 الهاتف: ' + order.phone + '\n' +
      '📍 الولاية: ' + order.wilaya + '\n' +
      '🏘 البلدية: ' + order.commune + '\n' +
      '📦 العرض: ' + order.offer + '\n' +
      '🕒 التاريخ: ' + order.date;

    const waUrl = 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER +
      '?text=' + encodeURIComponent(msg);
    window.open(waUrl, '_blank');

    sheetPromise.finally(function () {
      btn.disabled = false;
      btn.textContent = '✅ تأكيد الشراء';
      form.reset();
      document.querySelectorAll('.offer-card')[0].click();
      document.getElementById('successModal').classList.add('show');
    });
  });
});

function closeModal() {
  document.getElementById('successModal').classList.remove('show');
}
