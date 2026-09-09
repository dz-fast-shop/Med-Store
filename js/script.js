// منطق صفحة الهبوط COD - إرسال حصري وموثوق إلى Google Sheets مع حساب التوصيل
document.addEventListener('DOMContentLoaded', function () {

  // أسعار توصيل ياليدين انطلاقاً من عنابة
  const yalidineTarifs = {
    "عنابة": { home: 590, desk: 450 },
    "الجزائر": { home: 700, desk: 550 },
    "سكيكدة": { home: 700, desk: 550 },
    "قالمة": { home: 700, desk: 550 },
    "قسنطينة": { home: 700, desk: 550 },
    "الطارف": { home: 700, desk: 550 },
    "الشلف": { home: 800, desk: 650 },
    "أم البواقي": { home: 800, desk: 650 },
    "باتنة": { home: 800, desk: 650 },
    "بجاية": { home: 800, desk: 650 },
    "البليدة": { home: 800, desk: 650 },
    "البويرة": { home: 800, desk: 650 },
    "تلمسان": { home: 800, desk: 650 },
    "تيزي وزو": { home: 800, desk: 650 },
    "جيجل": { home: 800, desk: 650 },
    "سطيف": { home: 800, desk: 650 },
    "سيدي بلعباس": { home: 800, desk: 650 },
    "المدية": { home: 800, desk: 650 },
    "مستغانم": { home: 800, desk: 650 },
    "المسيلة": { home: 800, desk: 650 },
    "معسكر": { home: 800, desk: 650 },
    "وهران": { home: 800, desk: 650 },
    "برج بوعريريج": { home: 800, desk: 650 },
    "بومرداس": { home: 800, desk: 650 },
    "خنشلة": { home: 800, desk: 650 },
    "سوق أهراس": { home: 800, desk: 650 },
    "تيبازة": { home: 800, desk: 650 },
    "ميلة": { home: 800, desk: 650 },
    "عين الدفلى": { home: 800, desk: 650 },
    "غليزان": { home: 800, desk: 650 },
    "بسكرة": { home: 900, desk: 750 },
    "تبسة": { home: 900, desk: 750 },
    "تيارت": { home: 900, desk: 750 },
    "الجلفة": { home: 900, desk: 750 },
    "سعيدة": { home: 900, desk: 750 },
    "تيسمسيلت": { home: 900, desk: 750 },
    "عين تموشنت": { home: 900, desk: 750 },
    "أولاد جلال": { home: 900, desk: 750 },
    "الأغواط": { home: 1150, desk: 950 },
    "ورقلة": { home: 1150, desk: 950 },
    "الوادي": { home: 1150, desk: 950 },
    "غرداية": { home: 1150, desk: 950 },
    "تقرت": { home: 1150, desk: 950 },
    "المغير": { home: 1150, desk: 950 },
    "المنيعة": { home: 1150, desk: 950 },
    "أدرار": { home: 1650, desk: 1450 },
    "بشار": { home: 1650, desk: 1450 },
    "تمنراست": { home: 1650, desk: 1450 },
    "البيض": { home: 1650, desk: 1450 },
    "إليزي": { home: 1650, desk: 1450 },
    "تندوف": { home: 1650, desk: 1450 },
    "النعامة": { home: 1650, desk: 1450 },
    "تيميمون": { home: 1650, desk: 1450 },
    "برج باجي مختار": { home: 1650, desk: 1450 },
    "بني عباس": { home: 1650, desk: 1450 },
    "عين صالح": { home: 1650, desk: 1450 },
    "إن قزام": { home: 1650, desk: 1450 },
    "جانت": { home: 1650, desk: 1450 }
  };

  // 1) تعبئة قائمة الولايات
  const wilayaSelect = document.getElementById('wilaya');
  let communeSelect = document.getElementById('commune');

  if (typeof WILAYAS !== 'undefined' && wilayaSelect) {
    WILAYAS.forEach(function (w, i) {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = (i + 1) + ' - ' + w;
      wilayaSelect.appendChild(opt);
    });
  }

  // 2) تعبئة البلديات وتحديث سعر التوصيل عند اختيار الولاية
  if (wilayaSelect) {
    wilayaSelect.addEventListener('change', function () {
      communeSelect = document.getElementById('commune'); // Re-fetch in case it was replaced by input
      if (communeSelect && communeSelect.tagName === 'SELECT') {
        communeSelect.innerHTML = '';
        const list = (typeof COMMUNES !== 'undefined' && COMMUNES[this.value]) ? COMMUNES[this.value] : [];

        if (list.length === 0) {
          communeSelect.disabled = false;
          const input = document.createElement('input');
          input.type = 'text';
          input.id = 'commune';
          input.name = 'commune';
          input.placeholder = 'اكتب اسم البلدية';
          input.required = true;
          input.className = 'field-input';
          input.style.cssText = 'width:100%;padding:13px 14px;border:2px solid #e5e7eb;border-radius:12px;font-size:15px;';
          communeSelect.replaceWith(input);
        } else {
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
        }
      }
      updateTotal();
    });
  }

  // 3) اختيار العرض وتحديث السعر
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

      updateTotal();
    });
  });

  // 4) تغيير نوع التوصيل (منزل / مكتب)
  const deliveryOptions = document.querySelectorAll('input[name="delivery_type"]');
  deliveryOptions.forEach(function (opt) {
    opt.addEventListener('change', function (e) {
      document.querySelectorAll('.delivery-option').forEach(function (el) { el.classList.remove('selected'); });
      e.target.closest('.delivery-option').classList.add('selected');
      updateTotal();
    });
  });

  // 5) دالة حساب وحساب المجموع الكلي وسعر التوصيل
  function updateTotal() {
    const selectedWilaya = wilayaSelect ? wilayaSelect.value : '';
    const selectedTypeInput = document.querySelector('input[name="delivery_type"]:checked');
    const selectedType = selectedTypeInput ? selectedTypeInput.value : 'home';
    const selectedCard = document.querySelector('.offer-card.selected');

    const productPrice = selectedCard ? (parseInt(selectedCard.dataset.price) || 1900) : 1900;
    let deliveryPrice = 0;

    const deliveryPriceEl = document.getElementById('summaryDeliveryPrice');
    const productPriceEl = document.getElementById('summaryProductPrice');
    const totalPriceEl = document.getElementById('summaryTotalPrice');

    if (selectedWilaya && yalidineTarifs[selectedWilaya]) {
      deliveryPrice = yalidineTarifs[selectedWilaya][selectedType];
      if (deliveryPriceEl) deliveryPriceEl.textContent = deliveryPrice + ' دج';
    } else {
      if (deliveryPriceEl) deliveryPriceEl.textContent = 'اختر الولاية';
    }

    const totalPrice = productPrice + deliveryPrice;

    if (productPriceEl) productPriceEl.textContent = productPrice + ' دج';
    if (totalPriceEl) totalPriceEl.textContent = totalPrice + ' دج';
  }

  // 6) إرسال النموذج إلى Google Sheets
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

      const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
      const deliveryType = deliveryTypeInput ? (deliveryTypeInput.value === 'home' ? 'توصيل للبيت' : 'استلام من المكتب') : 'توصيل للبيت';

      const deliveryPriceText = document.getElementById('summaryDeliveryPrice') ? document.getElementById('summaryDeliveryPrice').textContent : '0 دج';
      const totalPriceText = document.getElementById('summaryTotalPrice') ? document.getElementById('summaryTotalPrice').textContent : offer;

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
        delivery_type: deliveryType,
        delivery_price: deliveryPriceText,
        total_price: totalPriceText,
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
        btn.textContent = '✅ تأكيد الشراء الآن';
        return;
      }

      // إرسال البيانات كنص صريح تفادياً لحظر CORS من جوجل
      fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(order)
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = '✅ تأكيد الشراء الآن';
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
        btn.textContent = '✅ تأكيد الشراء الآن';
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
