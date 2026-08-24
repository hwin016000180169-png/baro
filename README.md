# 바로철거 (탑클린바로철거) 홈페이지

철거·폐기물 처리 전문 업체 **바로철거**의 홈페이지입니다.
빌드 도구 없이 동작하는 순수 HTML · CSS · JavaScript 정적 사이트로, 카페24 웹호스팅에 FTP로 그대로 업로드합니다.

## 구조

```
index.html          메인 (원페이지 · 풀페이지 스냅 스크롤)
demolition.html     철거예약
waste.html          폐기물예약
gallery.html        시공사례 (라이트박스)
support.html        고객센터
privacy.html        개인정보처리방침
robots.txt / sitemap.xml
assets/
  css/  common.css  변수·리셋·헤더·푸터·버튼
        pages.css   페이지별 스타일 + 스냅 모드
  js/   common.js   스냅 스크롤·스크롤 리빌·카운트업·라이트박스
        form.js     예약 폼 검증·전송
  img/              로고 및 사이트 이미지
로고/                로고 원본 소스 (AI · PNG · JPG)
```

## 기술 원칙

- **빌드 단계 없음.** npm·webpack·React 등 도입 금지. 파일을 그대로 올려 동작해야 합니다.
- 모든 경로는 **상대경로** (`./assets/...`)
- 폰트는 Pretendard CDN, jQuery 미사용
- 스크롤 연출은 `IntersectionObserver` 기반 자체 구현 (외부 라이브러리 없음)
- `prefers-reduced-motion` 존중, 모바일 360px부터 대응

## 이미지 작업

이미지 슬롯은 `<div class="ph">` 플레이스홀더로 표시되어 있습니다.
이미지를 채우는 작업(사람·AI 무관)은 반드시 **[IMAGE_GUIDE.md](./IMAGE_GUIDE.md)** 를 먼저 읽고 진행하세요.
슬롯 목록·규격·무드 기준·삽입 코드·검증 절차가 모두 정리되어 있습니다.

## 배포 전 교체할 플레이스홀더

| 항목 | 표기 | 위치 |
|---|---|---|
| 전화번호 | `010-0000-0000` | 전 페이지 · JSON-LD |
| 도메인 | `https://www.example.com/` | canonical · OG · sitemap.xml |
| 사업자 정보 | `[대표자명]` `[사업자번호]` `[사업장 주소]` `[이메일]` | 푸터 |
| 카카오톡 채널 | `[카카오톡 채널 URL]` | 모바일 하단 바 |
| 폼 전송 주소 | `[APPS_SCRIPT_URL]` | `assets/js/form.js` |
| 소유권 확인 | 네이버·구글 인증 메타태그 | 각 페이지 `<head>` 주석 |
