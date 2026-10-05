# Arivom Thittam — Native iOS Application (Swift & SwiftUI)

> **Know Your Schemes. Claim Your Benefits.**  
> *அரசு திட்டங்களை அறிவோம். உரிமைகளைப் பெறுவோம்.*

A genuine native iOS application built with **Swift 5.9+ and SwiftUI**, maintaining 100% architectural and rule parity with the Web and Android apps.

---

## 🏛️ Architecture & Folder Structure

```
apps/ios/
├── ArivomThittam.xcodeproj/          # Xcode Project Configuration
│   └── project.pbxproj
└── ArivomThittam/
    ├── App/
    │   └── ArivomThittamApp.swift    # App Entrypoint (@main)
    ├── Models/
    │   ├── CitizenProfile.swift      # Profile & family entities
    │   ├── Scheme.swift              # Scheme, benefit, rules, document models
    │   └── EligibilityResult.swift   # Match scores, breakdown, status enums
    ├── Domain/
    │   ├── DeterministicEligibilityEngine.swift  # Zero-hallucination evaluator
    │   └── TranslationManager.swift  # English & Tamil dynamic localization
    ├── Repository/
    │   ├── SchemeRepository.swift    # Async repository protocol
    │   ├── DefaultSchemes.swift      # Preloaded welfare scheme catalog
    │   └── LocalSchemeRepository.swift # Filtered search & query engine
    ├── ViewModels/
    │   ├── AppState.swift            # Observable global state (profile, bookmarks)
    │   ├── DashboardViewModel.swift  # Search, categories, scheme list
    │   └── EligibilityViewModel.swift # Questionnaire state & live evaluation
    ├── Views/
    │   ├── MainTabView.swift         # Root TabView with 4 primary workflows
    │   ├── DashboardView.swift       # Home discovery hub
    │   ├── SchemeCardView.swift      # Polished card with badges & benefits
    │   ├── SchemeDetailView.swift    # Full details, roadmap, checklist & links
    │   ├── EligibilityWizardView.swift # Interactive citizen assessment form
    │   ├── EligibilityResultView.swift # Ranked results with "Why You Qualify"
    │   ├── VoiceAssistantView.swift  # Civic voice guide in Tamil & English
    │   └── Components/
    │       ├── BadgeView.swift       # Status & match level pills
    │       └── CategoryChipView.swift # Horizontal scrolling filter chips
    └── Resources/
        ├── Info.plist                # Permissions (mic, speech) & metadata
        └── Assets.xcassets/          # App icon & color sets
```

---

## ⚖️ Deterministic Eligibility Guarantee

- **Zero Hallucination**: AI / LLMs never make eligibility decisions.
- **Spec Parity**: Implements the identical evaluation criteria defined in `packages/eligibility-spec`, matching `DeterministicEligibilityEngine.kt` (Android) and `eligibilityEngine.ts` (Web).
- **Offline First**: All statutory scheme data is preloaded locally in `DefaultSchemes.swift`, allowing instant zero-internet assessment.

---

## 🚀 Building & Running Locally

### Prerequisites
- macOS 14+ (Sonoma or Sequoia)
- Xcode 15+ / 16+
- iOS 17.0+ Simulator or Device

### In Xcode (GUI)
1. Double-click `apps/ios/ArivomThittam.xcodeproj` to open in Xcode.
2. Select your target simulator (e.g., iPhone 15 Pro, iPhone 16).
3. Press `Cmd + R` to Build and Run.

### Via Command Line (`xcodebuild`)
```bash
cd apps/ios

# Build for iOS Simulator
xcodebuild \
  -project ArivomThittam.xcodeproj \
  -scheme ArivomThittam \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

---

## 🤖 Automated CI Workflow (GitHub Actions)

An automated GitHub Actions workflow is provided at `.github/workflows/build-ios-release.yml`.
- Runs on `macos-14` / `macos-15` runner.
- Builds the application using `xcodebuild`.
- Archives the application as a GitHub Release and downloadable artifact.
