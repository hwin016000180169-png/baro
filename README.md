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
  js/   common.js   히어로 영상·스냅 스크롤·스크롤 리빌·카운트업·라이트박스
        form.js     예약 폼 검증·전송
emailjs/            예약 폼 메일 발송 설정 (배포되지 않는 참고 파일)
  README.md         EmailJS 설정 절차 · 문제 해결
  template.html     EmailJS 템플릿에 붙여넣을 메일 본문
  img/              로고 및 사이트 이미지
  video/            히어로 배경 영상 (hero.mp4 · hero.webm · hero-poster.jpg)
                    원본 .mov 은 .gitignore 처리 — 변환본만 커밋
로고/                로고 원본 소스 (AI · PNG · JPG)
```

## 기술 원칙

- **빌드 단계 없음.** npm·webpack·React 등 도입 금지. 파일을 그대로 올려 동작해야 합니다.
- 모든 경로는 **상대경로** (`./assets/...`)
- 폰트는 Pretendard CDN, jQuery 미사용
- 팔레트는 **네이비 + 화이트**. 색은 전부 `assets/css/common.css` 최상단 `:root` 변수로만 쓴다
  (밝은 배경 강조 `--color-accent` / 네이비 위 강조 `--color-accent-soft` — 둘을 바꿔 쓰면 대비가 무너짐)
- 모서리도 변수로만: `--radius-sm` 8px · `--radius` 12px · `--radius-lg` 18px · `--radius-pill`
- 스크롤 연출은 `IntersectionObserver` 기반 자체 구현 (외부 라이브러리 없음)
- `prefers-reduced-motion` 존중, 모바일 360px부터 대응

## 작업 기록

날짜별 작업 내용·다음 할 일·작업 시 주의사항은 **[WORKLOG.md](./WORKLOG.md)** 에 정리되어 있습니다.
작업을 시작하기 전에 먼저 읽어보세요.

## 이미지 작업

이미지 슬롯 16곳은 모두 실사 이미지로 채워져 있습니다 (히어로 1 · 메인 시공사례 6 · 갤러리 9).
이미지를 **교체하거나 추가**하는 작업(사람·AI 무관)은 반드시 **[IMAGE_GUIDE.md](./IMAGE_GUIDE.md)** 를 먼저 읽고 진행하세요.
규격·무드 기준·삽입 코드·검증 절차가 모두 정리되어 있습니다.

## 배포 전 남은 항목

실제 정보가 반영된 항목: 도메인 `direct-demolition.com`, 대표번호 `1661-8570`, 상호·사업자등록번호·의정부본점/구리지점 주소, SNS 링크, 이미지 16곳.

아래는 자료를 받는 즉시 채우면 되는 항목입니다.

| 항목 | 표기 | 위치 | 미설정 시 동작 |
|---|---|---|---|
| 대표자명 | `[대표자명]` | 전 페이지 푸터 · privacy.html | 대괄호가 그대로 노출됨 (반드시 교체) |
| 이메일 | `[이메일]` | 전 페이지 푸터 · privacy.html | 대괄호가 그대로 노출됨 (반드시 교체) |
| 카카오톡 채널 URL | `KAKAO_URL` | `assets/js/common.js` 상단 | 카카오 버튼 자동 숨김 · 모바일 하단 바는 전화 상담이 전체 폭 |
| 폼 메일 발송 | `EMAILJS` 3개 키 | `assets/js/form.js` 상단 | 예약 폼 제출 시 `온라인 접수 준비 중입니다` + 전화 상담 안내<br>설정 절차는 [`emailjs/README.md`](./emailjs/README.md) |
| 공지사항 | 홈페이지 오픈 공지 1건 | `support.html` 공지사항 | 실제 공지 추가는 해당 위치 주석 참고 |
| 소유권 확인 | 네이버·구글 인증 메타태그 | 각 페이지 `<head>` 주석 | 검색엔진 등록 시 필요 |

> `[대표자명]`·`[이메일]`은 페이지에 그대로 보이므로 **배포 전 필수 교체**입니다.
> 나머지는 비워둔 채 배포해도 화면이 깨지지 않도록 처리되어 있습니다.
