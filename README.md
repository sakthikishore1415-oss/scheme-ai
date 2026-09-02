# Arivom Thittam (அறிவோம் திட்டம்) — Monorepo

> **Know Your Schemes. Claim Your Benefits.**  
> *அரசு திட்டங்களை அறிவோம். உரிமைகளைப் பெறுவோம்.*

A unified, multi-platform civic access platform designed to make government welfare schemes discoverable, transparent, and claimable by every Indian citizen across smartphone, voice, and zero-internet interfaces.

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
│   └── android/                 # Native Kotlin + Jetpack Compose + Material 3
│       ├── app/
│       │   ├── src/main/java/com/arivomthittam/
│       │   │   ├── data/model/          # Shared entity contracts
│       │   │   ├── data/repository/     # Repository layer
│       │   │   ├── domain/eligibility/  # Deterministic Kotlin Engine
│       │   │   ├── ui/screens/          # Jetpack Compose Screens
│       │   │   ├── ui/theme/            # Material 3 Accessible Theme
│       │   │   ├── ui/components/       # Reusable Compose Widgets
│       │   │   ├── viewmodel/           # Coroutine State Management
│       │   │   └── MainActivity.kt
│       │   ├── src/main/res/
│       │   ├── src/main/AndroidManifest.xml
│       │   └── build.gradle.kts
│       ├── gradle/wrapper/
│       ├── gradlew
│       ├── build.gradle.kts
│       ├── settings.gradle.kts
│       └── gradle.properties
│
├── packages/
│   ├── api-contracts/           # Shared TypeScript interfaces & Kotlin models
│   ├── scheme-data/             # Scheme repository contracts & schemas
│   └── eligibility-spec/        # Authoritative deterministic eligibility spec
│
├── .github/
│   └── workflows/
│       └── build-android-release.yml  # Manual APK build & GitHub Releases workflow
│
├── package.json                 # Monorepo root package.json
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── turbo.json                   # Turborepo task pipeline
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start & Development

### Prerequisites
- **Node.js**: `v20+` or `v24+`
- **pnpm**: `v10+` (`npm i -g pnpm`)
- **JDK**: `17+` (for Android)
- **Android SDK**: `35` / `API 24+` (for Android)

---

### 🌐 Web Application (React + Vite)

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Start Web local development server
pnpm dev

# 3. Typecheck all packages and apps
pnpm lint

# 4. Build production bundle (Turborepo)
pnpm build
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

## 🤖 GitHub Actions Workflow (Build & Release APK)

An automated GitHub Actions workflow is provided at [`.github/workflows/build-android-release.yml`](.github/workflows/build-android-release.yml).

- **Trigger**: Strictly on **`workflow_dispatch`** (manual trigger from the GitHub Actions tab).
- **Functionality**:
  1. Sets up JDK 17 and Android SDK.
  2. Runs `./gradlew assembleDebug`.
  3. Archives the APK as an artifact.
  4. Automatically publishes a new GitHub Release with the APK attached.

---

## ⚖️ Deterministic Eligibility Guarantee

- **Zero Hallucination**: AI / LLMs **never** make eligibility decisions.
- **Spec Parity**: The Web TypeScript engine (`apps/web/src/engine/eligibilityEngine.ts`) and Android Kotlin engine (`apps/android/.../DeterministicEligibilityEngine.kt`) strictly follow the same criteria specification defined in [`packages/eligibility-spec`](packages/eligibility-spec).
- **Honest Data States**: Displays honest empty/loading/error states (`status: 'NO_DATA'`) when no verified backend is attached.

