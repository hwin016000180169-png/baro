# 예약 폼 메일 발송 — EmailJS 설정

철거예약 · 폐기물예약 폼이 제출되면 **네이버 메일로 접수 내용이 날아온다.**
서버 없이 동작하고, 접수는 전화·카톡으로 이미 받고 있으므로 **메일은 알림 용도만** 한다.

> **로그인이 필요한 단계라 계정 주인이 직접 해야 한다.** 아래를 따라 하면 10분쯤 걸린다.
> 마지막에 나오는 **ID 3개**만 넘겨주면 연결이 끝난다.
> **비밀번호는 누구에게도 알려주지 말 것.** 이 설정에는 필요하지 않다.

---

## 설정

**1. EmailJS 가입**

[emailjs.com](https://www.emailjs.com) → Sign Up. 무료 요금제로 **월 200통**까지 보낸다.

**2. 발송 계정 연결** (Email Services → Add New Service)

**Gmail** 을 고르고 **Connect Account** → 받아온 고객 구글 계정으로 로그인해 권한 허용.

> 여기서 연결하는 계정은 **보내는 쪽**이다. 받는 쪽(네이버)은 3번에서 정한다.

연결되면 **Service ID** (`service_xxxxxxx`) 가 생긴다. → **①**

**3. 템플릿 만들기** (Email Templates → Create New Template)

| 칸 | 넣을 값 |
|---|---|
| **To Email** | `ssimyong@naver.com` ← **여기에 직접 적는다** |
| **From Name** | `바로철거 홈페이지` |
| **Reply To** | `ssimyong@naver.com` |
| **Subject** | `[바로철거] {{type_label}} 신청 — {{name}} ({{region}})` |
| **Content** | 우측 상단을 **Code** 로 바꾸고 [`template.html`](./template.html) 내용을 통째로 붙여넣기 |

> **받는 주소는 반드시 템플릿에 직접 적는다.** 변수로 넘기면 남이 우리 키를 주워
> 아무 주소로나 메일을 쏘는 통로가 된다. 홈페이지 코드는 받는 주소를 모르는 게 맞다.

저장하면 **Template ID** (`template_xxxxxxx`) 가 생긴다. → **②**

**4. Public Key 확인** (Account → General)

**Public Key** 를 복사한다. → **③**

**5. 허용 도메인 잠그기** (Account → Security)

**Allow list** 에 우리 도메인만 넣는다. 이 설정이 사실상 유일한 자물쇠다.

```
direct-demolition.com
www.direct-demolition.com
```

> Public Key는 홈페이지 소스에 그대로 보인다. **숨길 수 없는 구조다.**
> 대신 허용 도메인을 잠그면 다른 사이트에서 우리 키로 보내려는 시도가 차단된다.
> 도메인이 바뀌면 여기도 같이 바꿔야 한다.

**6. 테스트 발송**

템플릿 편집 화면 우측 상단 **Test It** → 변수에 아무 값이나 넣고 발송.
**네이버 메일로 도착하면 성공이다.** 스팸함도 확인해 볼 것.

**7. ID 3개 전달**

```
Service ID  : service_xxxxxxx
Template ID : template_xxxxxxx
Public Key  : xxxxxxxxxxxxxxx
```

이 셋을 알려주면 [`assets/js/form.js`](../assets/js/form.js) 상단 `EMAILJS` 에 넣어 연결을 끝낸다.
(직접 넣어도 된다 — 파일 맨 위 한 곳뿐이다.)

---

## 연결 확인

세 값을 채운 뒤 철거예약 페이지에서 실제로 한 건 넣어본다.

| 결과 | 원인과 조치 |
|---|---|
| "신청이 접수되었습니다" + 메일 도착 | 정상 |
| "전송에 실패했습니다" | **F12 → Console** 에 이유가 그대로 찍힌다. 아래 표 참고 |
| 접수는 되는데 메일이 안 옴 | 네이버 **스팸함** 확인. 템플릿 **To Email** 오타 확인 |
| 메일은 오는데 칸이 비어 있음 | 템플릿 `{{변수}}` 철자가 `form.js` 의 키와 다르다 |

콘솔에 찍히는 대표적인 이유 —

| 메시지 | 뜻 |
|---|---|
| `API calls are disabled for non-browser applications` | 5번 허용 도메인에 지금 접속한 주소가 없다. 로컬 테스트 중이면 `localhost` 를 임시로 추가 |
| `The Public Key is invalid` | Public Key 오타 |
| `The service ID not found` / `template ID not found` | ① ② 오타 |
| `You have exceeded the monthly quota` | 무료 월 200통 초과 |

---

## 알아둘 것

**① Public Key는 감출 수 없다.**
브라우저에서 직접 보내는 방식이라 키가 소스에 노출된다. EmailJS 구조상 정상이고,
방어선은 **허용 도메인 + 월 200통 한도** 두 가지다. 유출돼도 남이 할 수 있는 건
우리 템플릿으로 **우리 네이버 주소에 메일을 보내는 것**뿐이다 (받는 주소가 템플릿에 박혀 있으므로).
접수 스팸이 들어오면 Public Key를 새로 발급하면 된다.

**② 접수 기록은 메일함이 전부다.**
따로 장부를 두지 않기로 했으므로 **메일을 지우면 그 신청은 흔적이 없다.**
네이버 메일에 `바로철거 접수` 폴더를 만들고 필터로 자동 분류해 두면 관리가 쉽다.

**③ 라이브러리를 붙이지 않았다.**
EmailJS 공식 SDK 대신 REST API를 `fetch` 로 직접 호출한다.
이 프로젝트는 외부 라이브러리를 쓰지 않는 것이 원칙이고, SDK가 하는 일도 결국 이 요청 한 번이다.

**④ 개인정보**
이 폼은 **이름 · 연락처 · 주소 · 희망 날짜**를 수집한다.
수집 항목과 보관 기간이 [`privacy.html`](../privacy.html) 의 내용과 맞는지 확인하고,
보관 기간이 지난 접수 메일은 정리한다.
