# Google Play 스토어 출시 정보 (안드로이드 우선)

> iOS 출시 시 재사용할 수 있도록 일부 항목은 함께 적어둠.

## 앱 이름 (Title / 30자)
- 한국어: 낱말 카드 - 아기 한국어 영어
- English: Word Card - Baby Korean English

## 짧은 설명 (Short description / 80자)
- 한국어: 아기·유아를 위한 한국어·영어 낱말 카드. 이모지 138개, 발음, 녹음, 퀴즈.
- English: Korean-English flashcards for babies & toddlers. 138 cards, TTS, quizzes.

## 카테고리
- 카테고리: 교육 (Education)
- 태그: 유아, 교육, 언어 학습

## 콘텐츠 등급 / 타깃 대상
- 전체이용가 (PEGI 3 / 만 3세 이상)
- **타깃 연령층에 "만 5세 이하 포함" → 가족용 정책(Families Policy) 적용**
- 아동 대상 앱 (COPPA / GDPR-K 준수, 비개인화 광고만)

## 자세한 설명 (한국어)
아이와 함께하는 즐거운 낱말 학습! 🐶🍎🚗

낱말 카드는 아기와 유아를 위한 한국어/영어 낱말 카드 앱입니다.
귀여운 이모지와 함께 10개 카테고리, 138개의 기본 낱말 카드가 준비되어 있어요.

■ 주요 기능
- 138개 기본 카드 (동물, 과일, 탈것, 음식, 신체 등 10개 카테고리)
- 한국어/영어 등 8개 언어 TTS 발음
- 부모님 목소리로 직접 발음 녹음
- 사진을 넣어 나만의 카드 만들기
- 손가락으로 넘기는 자동재생 모드
- 이모지 퀴즈 & 듣기 퀴즈로 재미있게 복습
- 다크 모드 지원
- 회원가입·로그인 없이 바로 사용

■ 안심하고 사용하세요
- 아동 개인정보를 수집하지 않습니다 (COPPA 준수)
- 녹음·사진은 모두 기기 안에만 저장됩니다
- 방해되는 배너 광고가 없습니다 (보상형 광고는 이용자가 선택할 때만)

■ 프리미엄 (1회 구매, 구독 아님)
- 무제한 카드 만들기
- 무제한 녹음
- 무제한 퀴즈
- 광고 완전 제거

## App Description (English)
Fun word learning with your child! 🐶🍎🚗

Word Card is a Korean/English flashcard app designed for babies and toddlers.
With adorable emojis, 10 categories, and 138 built-in word cards ready to go.

■ Key Features
- 138 built-in cards (animals, fruits, vehicles, food, body parts & more — 10 categories)
- TTS pronunciation in 8 languages including Korean & English
- Record pronunciations in a parent's own voice
- Create custom cards with your own photos
- Swipeable autoplay mode
- Emoji quiz & listening quiz for playful review
- Dark mode support
- No sign-up or login required

■ Safe & Private
- No personal data collected from children (COPPA compliant)
- All recordings & photos stay on your device
- No intrusive banner ads (rewarded ads only when the user opts in)

■ Premium (one-time purchase, not a subscription)
- Unlimited card creation
- Unlimited recordings
- Unlimited quizzes
- Removes all ads

## 그래픽 자료 (Play Console 필수)
| 항목 | 사양 | 비고 |
|------|------|------|
| 앱 아이콘 | 512×512 PNG | `assets/images/icon.png` 활용 |
| 피처 그래픽 | 1024×500 PNG/JPG | 직접 제작 필요 (필수) |
| 폰 스크린샷 | 최소 2장, 16:9 또는 9:16 | 아래 화면 캡처 |
| 7인치 태블릿 (선택) | 권장 | |

### 스크린샷 추천 화면
1. 홈 화면 (카테고리 목록)
2. 카드 보기 (큰 이모지 + 낱말 + 발음 버튼)
3. 이모지 퀴즈 화면
4. 카드 만들기 / 사진 추가 화면
5. 프리미엄 화면

## 개인정보 처리방침 URL
- GitHub Pages: `https://<github사용자명>.github.io/word_card/privacy.html`
- (저장소 Settings → Pages → Source: `docs/` 폴더로 설정하면 자동 배포됨)

## 인앱 결제 상품 (관리형 상품 / 비소모성)
| 상품 ID | 유형 | 가격 (USD) | 가격 (KRW 권장) |
|---------|------|-----------|----------------|
| wordcard_premium_lifetime | 관리형 상품 (1회성) | $14.99 | ₩19,000 |

> ⚠️ 자동 갱신 구독 상품 없음. 위 ID는 코드(`src/lib/iap.native.ts`)와 정확히 일치해야 함.
> AI 음성 크레딧 상품(`wordcard_credits_*`)은 현재 비활성화 상태이므로 등록하지 않음.

## 데이터 보안 양식 (Play Console) 답변 가이드
- 데이터 수집/공유: **수집하지 않음** (녹음·사진은 기기에만 저장, 서버 전송 없음)
- 마이크 권한: 기능(음성 녹음)에만 사용, 외부 전송 없음
- 광고 ID: AdMob 사용 시 "기기 또는 기타 ID" 수집으로 표시될 수 있음 → 광고 목적, 비개인화

## 출시 전 체크리스트 (안드로이드)
- [ ] Google Play 개발자 계정 등록 ($25 일회성)
- [ ] AdMob 계정 생성 → 실제 App ID + 보상형 광고 단위 ID 발급
- [ ] `app.json` android App ID 교체 + `admob.native.ts` 실제 ID 교체
- [ ] `eas init` (projectId / 업데이트 URL 자동 설정)
- [ ] `eas build --platform android --profile production` → .aab 생성
- [ ] Play Console에서 앱 생성 + .aab 업로드 (비공개 테스트 트랙)
- [ ] 인앱 상품 `wordcard_premium_lifetime` 등록
- [ ] 개인정보 처리방침 URL 등록 (GitHub Pages)
- [ ] 스토어 등록정보 (설명·아이콘·피처 그래픽·스크린샷)
- [ ] 콘텐츠 등급 설문 + 데이터 보안 양식 작성
- [ ] 타깃 대상 "만 5세 이하 포함" 선택
- [ ] 테스터 20명 / 14일 비공개 테스트 (신규 개인 개발자 의무)
- [ ] 프로덕션 출시 신청
