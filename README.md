# Arivom Thittam (அறிவோம் திட்டம்) — Monorepo

> **Know Your Schemes. Claim Your Benefits.**  
> *அரசு திட்டங்களை அறிவோம். உரிமைகளைப் பெறுவோம்.*

A unified, multi-platform civic access platform designed to make government welfare schemes discoverable, transparent, and claimable by every Indian citizen across smartphone (Web, Android, iOS), voice, and zero-internet interfaces.

---

## 🏛️ Monorepo Architecture

```
arivom-thittam/
│
├── apps/
│   ├── web/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── android/                 # Native Kotlin + Jetpack Compose + Material 3
│   │   ├── app/
│   │   │   ├── src/main/java/com/arivomthittam/
│   │   │   │   ├── data/model/          # Shared entity contracts
│   │   │   │   ├── data/repository/     # Repository layer
│   │   │   │   ├── domain/eligibility/  # Deterministic Kotlin Engine
│   │   │   │   ├── ui/screens/          # Jetpack Compose Screens
│   │   │   │   ├── ui/theme/            # Material 3 Accessible Theme
│   │   │   │   ├── ui/components/       # Reusable Compose Widgets
│   │   │   │   ├── viewmodel/           # Coroutine State Management
│   │   │   │   └── MainActivity.kt
│   │   │   ├── src/main/res/
│   │   │   ├── src/main/AndroidManifest.xml
│   │   │   └── build.gradle.kts
│   │   ├── gradle/wrapper/
│   │   ├── gradlew
│   │   ├── build.gradle.kts
│   │   ├── settings.gradle.kts
│   │   └── gradle.properties
│   │
│   └── ios/                     # Native Swift 5.9+ + SwiftUI
│       ├── ArivomThittam.xcodeproj/     # Xcode Project
│       └── ArivomThittam/
│           ├── App/                     # ArivomThittamApp.swift (@main)
│           ├── Models/                  # CitizenProfile, Scheme, EligibilityResult
│           ├── Domain/                  # DeterministicEligibilityEngine, TranslationManager
│           ├── Repository/              # SchemeRepository, DefaultSchemes, LocalSchemeRepository
│           ├── ViewModels/              # AppState, DashboardViewModel, EligibilityViewModel
│           ├── Views/                   # DashboardView, SchemeDetailView, EligibilityWizardView
│           └── Resources/               # Info.plist, Assets.xcassets
│
├── packages/
│   ├── api-contracts/           # Shared TypeScript interfaces & Kotlin/Swift models
│   ├── scheme-data/             # Scheme repository contracts & schemas
│   └── eligibility-spec/        # Authoritative deterministic eligibility spec
│
├── .github/
│   └── workflows/
│       ├── build-android-release.yml  # Manual APK build & GitHub Releases workflow
│       └── build-ios-release.yml      # Manual iOS Simulator/IPA build & GitHub Releases workflow
│
├── package.json                 # Monorepo root package.json (npm workspaces)
├── turbo.json                   # Turborepo task pipeline
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start & Development

### Prerequisites
- **Node.js**: `v20+` or `v24+`
- **npm**: `v10+` or `v11+`
- **JDK**: `17+` (for Android)
- **Android SDK**: `35` / `API 24+` (for Android)
- **macOS & Xcode**: `15+` / `16+` (for iOS)

---

### 🏗️ Unified Multi-Platform Build (Web + Android + iOS)

Running the normal build command compiles all targets in parallel via Turborepo:

```bash
# 1. Install workspace dependencies
npm install

# 2. Build all platforms (Web bundle + Android APK + iOS app)
npm run build

# Or build individual platforms:
npm run build:web      # Web production build (Vite + Tailwind)
npm run build:android  # Android build (Gradle APK)
npm run build:ios      # iOS build (xcodebuild)
```

---

### 📱 Android Native Application (Kotlin + Jetpack Compose)

The Android app is a **genuine native Kotlin & Jetpack Compose application** (no React Native, no Flutter, no WebView).

```bash
# Navigate to Android directory
cd apps/android

# Build Debug APK
./gradlew assembleDebug

# Build Release APK
./gradlew assembleRelease
```

---

### 🍎 iOS Native Application (Swift + SwiftUI)

The iOS app is a **genuine native Swift 5.9+ & SwiftUI application** located in [`apps/ios/`](apps/ios).

```bash
# Open directly in Xcode on macOS
open apps/ios/ArivomThittam.xcodeproj

# Or build via command line with xcodebuild
cd apps/ios
xcodebuild \
  -project ArivomThittam.xcodeproj \
  -scheme ArivomThittam \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

---

## 🤖 GitHub Actions Automated CI/CD Workflows

Automated workflows are available under [`.github/workflows/`](.github/workflows):

1. **Android APK Build**: [`.github/workflows/build-android-release.yml`](.github/workflows/build-android-release.yml)
   - Trigger: `workflow_dispatch`
   - Sets up JDK 17, compiles debug/release APK, and creates a GitHub Release.

2. **iOS App Build**: [`.github/workflows/build-ios-release.yml`](.github/workflows/build-ios-release.yml)
   - Trigger: `workflow_dispatch`
   - Runs on `macos-14`, builds the app bundle using `xcodebuild`, archives the simulator/app artifact, and publishes to GitHub Releases.

---

## ⚖️ Deterministic Eligibility Guarantee

- **Zero Hallucination**: AI / LLMs **never** make statutory eligibility decisions.
- **Spec Parity**: The Web TypeScript engine (`apps/web/src/engine/eligibilityEngine.ts`), Android Kotlin engine (`apps/android/.../DeterministicEligibilityEngine.kt`), and iOS Swift engine (`apps/ios/.../DeterministicEligibilityEngine.swift`) strictly follow the same criteria specification defined in [`packages/eligibility-spec`](packages/eligibility-spec).
- **Honest Data States**: Displays honest empty/loading/error states (`status: 'NO_DATA'`) when no verified backend is attached.
