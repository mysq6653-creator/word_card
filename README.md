# 낱말 카드 (Word Card)

9개월 아기를 위한 디지털 낱말 카드 앱.
종이 낱말카드는 물고 접고 찢어 오래 쓰기 어려워 만든 앱 버전입니다.

## 특징

- 🎨 5개 카테고리 × 8개 단어 = 40개 카드 (동물/과일/탈것/가족/사물)
- 🇰🇷 🇺🇸 한국어/영어 토글
- 🔊 TTS 발음 재생 (Web Speech API + 네이티브 OS TTS)
- 🎙️ **부모 목소리로 직접 녹음** (Web: IndexedDB / Native: FileSystem)
- ▶️ 자동재생 슬라이드쇼 (4초 간격, 화면 켜짐 유지)
- 👆 좌/우 스와이프 제스처
- 📱 PWA 설치 (iOS/Android 홈 화면 추가)
- 🌐 단일 코드베이스로 웹/iOS/Android 동시 지원 (Expo + RN Web)

## 기술 스택

- **Expo SDK 54** + Expo Router + TypeScript
- **React Native Web** — Vercel 정적 배포
- **react-native-reanimated + gesture-handler** — 스와이프/카드 애니메이션
- **Zustand** — 언어/자동재생 상태
- **expo-speech** — 한/영 TTS
- **expo-av** — 마이크 녹음 + 재생
- **expo-file-system** (네이티브) / **idb-keyval** (웹) — 녹음 저장

## 개발

```bash
npm install
npm run web        # 브라우저에서 개발
npm run ios        # iOS 시뮬레이터 (macOS 필요)
npm run android    # Android 에뮬레이터
```

## 웹 빌드 (Vercel)

```bash
npx expo export --platform web
# 결과: dist/ 디렉토리 → Vercel이 정적 호스팅
```

`vercel.json`에 빌드 명령이 설정되어 있어 Vercel에서 import만 하면 자동 배포됩니다.

## 네이티브 앱 빌드 (정식 출시 시)

```bash
npx expo install eas-cli
eas build --platform ios
eas build --platform android
```

## 폴더 구조

```
app/                    # Expo Router (라우트)
  _layout.tsx
  index.tsx             # 홈 (카테고리 그리드)
  category/[id].tsx     # 카드 뷰어
src/
  components/
    VoiceRecorder.tsx
  data/
    words.ts            # 카테고리/단어 데이터
  lib/
    tts.ts              # expo-speech 래퍼
    recorder.ts         # expo-av 녹음/재생
    audioStorage.ts     # 네이티브: FileSystem
    audioStorage.web.ts # 웹: IndexedDB
    theme.ts
  store/
    useCardStore.ts     # Zustand
```
