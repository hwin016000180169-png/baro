/* ============================================================
   바로철거 — form.js
   예약 폼 검증 · 전송 (Google Apps Script 웹 앱)
   ============================================================ */
(function () {
  'use strict';

  // TODO: Google Apps Script 웹 앱 배포 URL로 교체
  var FORM_ENDPOINT = '[APPS_SCRIPT_URL]';
  // TODO: 실제 전화번호로 교체
  var TEL_DISPLAY = '010-0000-0000';
  var TEL_HREF = 'tel:01000000000';

  var form = document.querySelector('.reserve-form');
  if (!form) return;

  /* ---------- 희망 날짜: 오늘 이전 선택 불가 ---------- */
  var dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    var now = new Date();
    var today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    dateInput.min = today;
  }

  /* ---------- 연락처: 숫자만 ---------- */
  var telInput = form.querySelector('input[type="tel"]');
  if (telInput) {
    telInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  /* ---------- 필드 검증 ---------- */
  function setInvalid(field, invalid) {
    var wrap = field.closest('.form-field');
    if (wrap) wrap.classList.toggle('invalid', invalid);
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    return !invalid;
  }

  function validateField(field) {
    var value = (field.value || '').trim();
    if (field.type === 'checkbox') return setInvalid(field, !field.checked);
    if (field.required && value === '') return setInvalid(field, true);
    if (field.type === 'tel' && !/^0\d{8,10}$/.test(value)) return setInvalid(field, true);
    if (field.type === 'date' && dateInput && value < dateInput.min) return setInvalid(field, true);
    return setInvalid(field, false);
  }

  form.querySelectorAll('[required]').forEach(function (field) {
    field.addEventListener('blur', function () { validateField(field); });
    field.addEventListener('change', function () { validateField(field); });
  });

  /* ---------- 전송 ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('[required]');
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중…';

    fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form) })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showResult(true);
      })
      .catch(function () {
        showResult(false);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });

  function showResult(ok) {
    var box = document.createElement('div');
    box.className = 'form-result';
    box.setAttribute('role', 'status');
    if (ok) {
      box.innerHTML =
        '<h3>신청이 접수되었습니다</h3>' +
        '<p>확인 후 빠르게 연락드리겠습니다.<br>급한 현장은 전화가 가장 빠릅니다.</p>' +
        '<a class="btn btn-accent" href="' + TEL_HREF + '">전화 상담 <span class="num">' + TEL_DISPLAY + '</span></a>';
      form.replaceWith(box);
      box.scrollIntoView({ block: 'center' });
    } else {
      var prev = form.parentNode.querySelector('.form-result');
      if (prev) prev.remove();
      box.innerHTML =
        '<h3>전송에 실패했습니다</h3>' +
        '<p>잠시 후 다시 시도하시거나, 전화로 문의해 주세요.</p>' +
        '<a class="btn btn-accent" href="' + TEL_HREF + '">전화 상담 <span class="num">' + TEL_DISPLAY + '</span></a>';
      form.parentNode.insertBefore(box, form);
      box.scrollIntoView({ block: 'center' });
    }
  }
})();
