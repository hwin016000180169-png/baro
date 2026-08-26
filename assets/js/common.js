/* ============================================================
   바로철거 — common.js
   헤더 스크롤 · 모바일 네비 · 스크롤 리빌 · 카운트업 · 플로팅 CTA
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ★ 카카오톡 채널 URL — 받는 즉시 이 한 줄만 채우면 전 페이지에 반영됩니다.
       예) var KAKAO_URL = 'https://pf.kakao.com/_xXxXxX';
       비워두면 카카오톡 버튼이 자동으로 숨겨지고, 모바일 하단 바는
       '전화 상담'이 전체 폭을 차지합니다. (깨진 링크가 노출되지 않음)
     ============================================================ */
  var KAKAO_URL = 'https://open.kakao.com/o/s9mDpxKi';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     오버레이 공통 처리 (모바일 메뉴 · 라이트박스)
       - 열려 있는 동안 뒤쪽 페이지를 키보드 탐색 대상에서 제외한다
       - Tab이 오버레이 밖으로 빠져나가지 않도록 가둔다
     ============================================================ */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function makeOverlay(roots, backdropSelectors) {
    var active = false;

    function focusables() {
      var out = [];
      roots.forEach(function (root) {
        if (!root) return;
        if (root.matches && root.matches(FOCUSABLE)) out.push(root);
        Array.prototype.push.apply(out, root.querySelectorAll(FOCUSABLE));
      });
      return out.filter(function (el) {
        return el.offsetWidth || el.offsetHeight || el.getClientRects().length;
      });
    }

    function backdrop() {
      var out = [];
      backdropSelectors.forEach(function (sel) {
        Array.prototype.push.apply(out, document.querySelectorAll(sel));
      });
      return out;
    }

    document.addEventListener('keydown', function (e) {
      if (!active || e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      var inside = roots.some(function (r) { return r && (r === document.activeElement || r.contains(document.activeElement)); });
      if (!inside) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }, true);

    return {
      activate: function () {
        active = true;
        backdrop().forEach(function (el) { el.inert = true; el.setAttribute('aria-hidden', 'true'); });
      },
      deactivate: function () {
        active = false;
        backdrop().forEach(function (el) { el.inert = false; el.removeAttribute('aria-hidden'); });
      }
    };
  }

  /* ---------- 헤더: 스크롤 시 배경 ---------- */
  var header = document.querySelector('.site-header');
  var floatingCall = document.querySelector('.floating-call');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (floatingCall) floatingCall.classList.toggle('visible', y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 모바일 네비 토글 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var gnb = document.querySelector('.gnb');
  if (toggle && gnb) {
    // 닫기 버튼(햄버거)도 메뉴의 일부이므로 포커스 대상에 함께 넣는다
    var navOverlay = makeOverlay([toggle, gnb], ['#main', '.site-footer', '.mobile-cta-bar', '.floating-call']);

    var setNav = function (open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      if (open) {
        navOverlay.activate();
        var firstLink = gnb.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        navOverlay.deactivate();
      }
    };

    toggle.addEventListener('click', function () {
      setNav(!document.body.classList.contains('nav-open'));
    });
    // 메뉴 링크 클릭 시 닫기
    document.querySelectorAll('.gnb a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
    // Esc로 닫고 햄버거로 포커스 복귀
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setNav(false);
        toggle.focus();
      }
    });
    // 데스크톱 폭으로 넓어지면 열린 상태를 정리 (배경이 잠긴 채 남지 않도록)
    var navMq = window.matchMedia('(min-width: 961px)');
    var onNavMq = function () { if (navMq.matches && document.body.classList.contains('nav-open')) setNav(false); };
    if (navMq.addEventListener) navMq.addEventListener('change', onNavMq);
    else if (navMq.addListener) navMq.addListener(onNavMq);
  }

  /* ---------- 숫자 카운트업 ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reducedMotion) { el.textContent = target; return; }
    var duration = 900;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 스크롤 리빌 (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
      el.querySelectorAll('[data-count]').forEach(countUp);
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 장비 섹션: 대수만큼 단위 블록 생성 ---------- */
  document.querySelectorAll('.fleet-row').forEach(function (row) {
    var wrap = row.querySelector('.fleet-bars');
    var count = parseInt(row.getAttribute('data-fleet'), 10);
    if (!wrap || isNaN(count)) return;
    for (var i = 0; i < count; i++) {
      var bar = document.createElement('i');
      bar.style.setProperty('--bar-delay', (0.25 + i * 0.06) + 's');
      wrap.appendChild(bar);
    }
    // "이상"을 뜻하는 점선 블록 하나
    var plus = document.createElement('i');
    plus.className = 'plus';
    plus.style.setProperty('--bar-delay', (0.25 + count * 0.06) + 's');
    wrap.appendChild(plus);
  });

  /* ---------- 갤러리 라이트박스 (gallery.html) ---------- */
  var lightbox = document.querySelector('.lightbox');
  var galleryItems = document.querySelectorAll('.gallery-item');
  if (lightbox && galleryItems.length) {
    var lbText = lightbox.querySelector('.lb-text');
    var lbCount = lightbox.querySelector('.lb-count');
    var current = 0;
    var lastFocus = null;
    var lbOverlay = makeOverlay([lightbox], ['#main', '.site-header', '.site-footer', '.mobile-cta-bar', '.floating-call']);

    function openLightbox(index) {
      current = index;
      updateLightbox();
      lastFocus = document.activeElement;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbOverlay.activate();
      lightbox.querySelector('.lightbox-close').focus();
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lbOverlay.deactivate();
      // 닫으면 방금 보던 사진의 카드로 포커스를 돌려준다 (←/→로 이동했을 수 있으므로 현재 사진 기준)
      var back = galleryItems[current] || lastFocus;
      if (back && back.focus) back.focus();
    }
    function updateLightbox() {
      var lbImg = lightbox.querySelector('.lb-img');
      var src = galleryItems[current].getAttribute('data-img');
      if (lbImg && src) { lbImg.src = src; lbImg.alt = galleryItems[current].getAttribute('data-caption') || ''; }
      lbText.textContent = galleryItems[current].getAttribute('data-caption') || '';
      lbCount.textContent = (current + 1) + ' / ' + galleryItems.length;
    }
    function move(delta) {
      current = (current + delta + galleryItems.length) % galleryItems.length;
      updateLightbox();
    }

    galleryItems.forEach(function (item, i) {
      item.addEventListener('click', function () { openLightbox(i); });
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { move(-1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { move(1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    });
  }

  /* ---------- 풀페이지 스냅 스크롤 (메인 · 데스크톱 전용) ----------
     휠 한 번에 다음 섹션으로 화면 전체가 이동.
     섹션이 뷰포트보다 길면 경계까지는 일반 스크롤을 허용한다. */
  (function () {
    if (!document.body.hasAttribute('data-snap')) return;
    if (reducedMotion) return;
    var mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    var sections = Array.prototype.slice.call(
      document.querySelectorAll('main > section, .site-footer')
    );
    if (sections.length < 2) return;

    var animating = false;

    function sectionTops() {
      var base = window.pageYOffset;
      return sections.map(function (s) {
        return Math.round(s.getBoundingClientRect().top + base);
      });
    }

    function animateTo(targetY) {
      animating = true;
      var startY = window.pageYOffset;
      var dist = targetY - startY;
      var dur = 800;
      var start = performance.now();
      function step(ts) {
        var p = Math.min((ts - start) / dur, 1);
        // easeOutExpo — 즉시 출발해 부드럽게 감속 (멈칫거림 없음)
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        // CSS scroll-behavior:smooth가 프레임마다 중첩되지 않도록 즉시 이동을 강제
        window.scrollTo({ top: startY + dist * e, left: 0, behavior: 'instant' });
        if (p < 1) requestAnimationFrame(step);
        else setTimeout(function () { animating = false; }, 250); // 관성 휠 잔여 입력 무시
      }
      requestAnimationFrame(step);
    }

    window.addEventListener('wheel', function (e) {
      if (!mq.matches) return;
      if (document.body.classList.contains('nav-open')) return;
      if (document.body.style.overflow === 'hidden') return;
      if (animating) { e.preventDefault(); return; }

      var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (!dir) return;

      var y = window.pageYOffset;
      var vh = window.innerHeight;
      var docH = document.documentElement.scrollHeight;
      var tops = sectionTops();

      // 현재 섹션 인덱스
      var i = 0;
      for (var k = 0; k < tops.length; k++) if (tops[k] <= y + 2) i = k;
      var secTop = tops[i];
      var secBottom = i + 1 < tops.length ? tops[i + 1] : docH;
      var tall = secBottom - secTop > vh + 40; // 몇 px 오차로 스냅이 두 번에 쪼개지지 않게 여유를 둔다

      // 뷰포트보다 긴 섹션 내부는 일반 스크롤 허용
      if (tall && dir > 0 && secBottom - (y + vh) > 4) return;
      if (tall && dir < 0 && y - secTop > 4) return;

      var target;
      if (dir > 0) {
        if (i >= tops.length - 1) return;
        target = tops[i + 1];
      } else {
        if (y - secTop > 4) target = secTop;      // 섹션 중간이면 섹션 상단으로
        else if (i === 0) return;
        else target = tops[i - 1];
      }

      target = Math.max(0, Math.min(target, docH - vh));
      if (Math.abs(target - y) < 2) return;

      e.preventDefault();
      animateTo(target);
    }, { passive: false });
  })();

  /* ---------- 카카오톡 링크 배선 (URL 없으면 버튼 숨김) ---------- */
  (function () {
    var url = (KAKAO_URL || '').trim();
    var bar = document.querySelector('.mobile-cta-bar');
    if (url) {
      document.querySelectorAll('[data-kakao]').forEach(function (a) { a.href = url; });
      document.querySelectorAll('[data-kakao-wrap]').forEach(function (el) { el.hidden = false; });
      if (bar) bar.classList.remove('is-single');
    } else {
      document.querySelectorAll('[data-kakao-wrap]').forEach(function (el) { el.hidden = true; });
      if (bar) bar.classList.add('is-single');
    }
  })();

  /* ---------- 푸터 연도 ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
