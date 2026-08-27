/* ============================================================
   바로철거 — form.js
   예약 폼 검증 · 메일 발송 (EmailJS)
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ★ EmailJS 설정 — 세 값을 받는 즉시 여기에 넣으세요.
       EmailJS 대시보드에서 그대로 복사하면 됩니다.

         serviceId  : Email Services  → service_xxxxxxx
         templateId : Email Templates → template_xxxxxxx
         publicKey  : Account → General → Public Key

       하나라도 비어 있으면 전송을 시도하지 않고 곧바로 '전화 상담' 안내를 띄웁니다.
       (접수되지 않은 신청이 접수된 것처럼 보이지 않게 하기 위함)

       설정 절차 · 문제 해결은 emailjs/README.md 참고.
     ============================================================ */
  var EMAILJS = {
    serviceId:  '',
    templateId: '',
    publicKey:  ''
  };

  /* 라이브러리를 붙이지 않고 REST API를 직접 호출한다.
     (EmailJS 공식 SDK가 하는 일도 결국 이 요청 한 번이다) */
  var EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

  // 대표번호
  var TEL_DISPLAY = '1661-8570';
  var TEL_HREF = 'tel:16618570';

  var TYPE_LABEL = { demolition: '철거예약', waste: '폐기물예약' };

  var form = document.querySelector('.reserve-form');
  if (!form) return;

  var configured = !!(EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey);

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

  /* ---------- 메일 본문에 들어갈 값 만들기 ---------- */
  function formatTel(raw) {
    var d = String(raw || '').replace(/[^0-9]/g, '');
    /* 서울만 지역번호가 두 자리다. 일괄로 세 자리씩 끊으면
       02-1234-5678 이 021-234-5678 로 깨져 그대로 잘못 걸게 된다 */
    if (d.indexOf('02') === 0 && (d.length === 9 || d.length === 10)) {
      return '02-' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    }
    if (d.length === 10 || d.length === 11) {
      return d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(-4);
    }
    return d;  // 형식을 모르면 원본 그대로 (검증은 통과한 번호다)
  }

  function stamp() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function buildParams() {
    var fd = new FormData(form);
    var get = function (k) { return String(fd.get(k) || '').trim(); };
    var type = get('type');

    /* 값이 비면 메일에 빈 줄이 생기므로 '-'로 채운다.
       키 이름은 EmailJS 템플릿의 {{변수}}와 정확히 일치해야 한다 —
       하나라도 어긋나면 그 자리만 조용히 빈 채로 도착한다 */
    return {
      type_label:   TYPE_LABEL[type] || type || '예약',
      name:         get('name'),
      tel:          formatTel(get('tel')),
      tel_raw:      get('tel'),
      region:       get('region'),
      address:      get('address') || '-',
      date:         get('date'),
      kind:         get('kind'),
      memo:         get('memo') || '-',
      submitted_at: stamp()
    };
  }

  /* ---------- 전송 ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('[required]');
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    if (!configured) { showResult(false, true); return; }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중…';

    /* 응답이 없어 버튼이 '전송 중…'에 영원히 묶이지 않도록 */
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);

    var opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      EMAILJS.serviceId,
        template_id:     EMAILJS.templateId,
        user_id:         EMAILJS.publicKey,
        template_params: buildParams()
      })
    };
    if (ctrl) opts.signal = ctrl.signal;

    fetch(EMAILJS_API, opts)
      .then(function (res) {
        /* 성공하면 200 + 본문 "OK".
           실패는 상태 코드와 함께 읽을 수 있는 이유가 본문에 담겨 온다
           (허용 도메인 미등록 · 키 오타 · 월 한도 초과 등) */
        if (res.ok) return null;
        return res.text().then(function (msg) {
          throw new Error('HTTP ' + res.status + ' — ' + (msg || '이유 없음'));
        });
      })
      .then(function () {
        clearTimeout(timer);
        showResult(true);
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (window.console) console.error('[예약 폼] 메일 발송 실패:', (err && err.message) || err);
        showResult(false);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });

  function showResult(ok, offline) {
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
        (offline
          ? '<h3>온라인 접수 준비 중입니다</h3>' +
            '<p>지금은 전화 상담으로 바로 도와드리고 있습니다.<br>연락 주시면 무료 현장 견적을 잡아드립니다.</p>'
          : '<h3>전송에 실패했습니다</h3>' +
            '<p>잠시 후 다시 시도하시거나, 전화로 문의해 주세요.</p>') +
        '<a class="btn btn-accent" href="' + TEL_HREF + '">전화 상담 <span class="num">' + TEL_DISPLAY + '</span></a>';
      form.parentNode.insertBefore(box, form);
      box.scrollIntoView({ block: 'center' });
    }
  }
})();
