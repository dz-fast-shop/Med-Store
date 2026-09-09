// منطق صفحة الهبوط COD - إرسال حصري إلى Google Sheets
document.addEventListener('DOMContentLoaded', function () {

  // 1) تعبئة قائمة الولايات
  const wilayaSelect = document.getElementById('wilaya');
  const communeSelect = document.getElementById('commune');
  
  if (typeof WILAYAS !== 'undefined' && wilayaSelect) {
    WILAYAS.forEach(function (w, i) {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = (i + 1) + ' - ' + w;
      wilayaSelect.appendChild(opt);
    });
  }

  // 2) تعبئة البلديات عند اختيار الولاية
  if (wilayaSelect && communeSelect) {
    wilayaSelect.addEventListener('change', function () {
      communeSelect.innerHTML = '';
      const list = (typeof COMMUNES !== 'undefined' && COMMUNES[this.value]) ? COMMUNES[this.value] : [];
      
      if (list.length === 0) {
        communeSelect.disabled = false;
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '— اكتب البلدية يدوياً —';
        communeSelect.appendChild(opt);
        
        // تحويلها لحقل نصي إذا لا توجد قائمة
        const input = document.createElement('input');
        input.type = 'text'; 
        input.id = 'commune'; 
        input.name = 'commune';
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
        opt.value = c; 
        opt.textContent = c;
        communeSelect.appendChild(opt);
      });
    });
  }

  // 3) اختيار العرض (تحديث السعر المعروض في الهيرو)
  const offerCards = document.querySelectorAll('.offer-card');
  offerCards.forEach(function (card) {
    card.addEventListener('click', function () {
      offerCards.forEach(function (c) { c.classList.remove('selected'); });
      this.classList.add('selected');
      
      const inputRadio = this.querySelector('input');
      if (inputRadio) inputRadio.checked = true;
      
      const newPriceEl = document.getElementById('newPrice');
      const oldPriceEl = document.getElementById('oldPrice');
      if (newPriceEl && this.dataset.price) newPriceEl.textContent = this.dataset.price + ' دج';
      if (oldPriceEl && this.dataset.old) oldPriceEl.textContent = this.dataset.old + ' دج';
    });
  });

  // 4) إرسال النموذج إلى Google Sheets
  const form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nom = document.getElementById('nom').value.trim();
      const phone = document.getElementById('phone').value.trim().replace(/\s/g, '');
      const wilaya = wilayaSelect ? wilayaSelect.value : '';
      const communeEl = document.getElementById('commune');
      const commune = communeEl ? communeEl.value.trim() : '';
      const offerInput = document.querySelector('input[name="offer"]:checked');
      const offer = offerInput ? offerInput.value : '';

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

      // التحقق من وجود رابط Webhook الخاص بـ Google Sheets
      const sheetUrl = (typeof CONFIG !== 'undefined' && CONFIG.SHEET_WEBHOOK_URL) ? CONFIG.SHEET_WEBHOOK_URL : '';

      if (!sheetUrl) {
        alert('⚠️ يرجى التأكد من وضع رابط Google Sheet Webhook في ملف js/data.js');
        btn.disabled = false;
        btn.textContent = '✅ تأكيد الشراء';
        return;
      }

      // إرسال البيانات إلى Google Sheets
      fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
      .then(function () {
        // عند إتمام الإرسال بنجاح
        btn.disabled = false;
        btn.textContent = '✅ تأكيد الشراء';
        form.reset();

        // إعادة التحديد التلقائي للعرض الأول
        if (offerCards[0]) {
          offerCards[0].click();
        }

        // إظهار نافذة الشكر للزبون
        const successModal = document.getElementById('successModal');
        if (successModal) {
          successModal.classList.add('show');
        }
      })
      .catch(function (error) {
        console.error('Error sending order:', error);
        btn.disabled = false;
        btn.textContent = '✅ تأكيد الشراء';
        alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
      });
    });
  }
});

// إغلاق نافذة النجاح
function closeModal() {
  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.classList.remove('show');
  }
}
