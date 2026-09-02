# Arivom Thittam — Authoritative Deterministic Eligibility Specification

## Principles
1. **Zero Hallucination / No Generative Decision-Making**: AI/LLMs must NEVER decide eligibility.
2. **Deterministic Gazette Matching**: Every criterion evaluates pure boolean/numeric conditions against published scheme rules.
3. **Cross-Platform Parity**: The Web TypeScript engine (`apps/web/src/engine/eligibilityEngine.ts`) and Android Kotlin engine (`apps/android/app/src/main/java/com/arivomthittam/domain/eligibility/DeterministicEligibilityEngine.kt`) must execute the EXACT same scoring and matching rules.

---

## Evaluation Algorithm

Given a `CitizenProfile` and a `Scheme`:

### Step 1: Mandatory Disqualifiers
- **Age Disqualification**: If `profile.age < scheme.minAge` or `profile.age > scheme.maxAge`, score = 0, status = `NOT_ELIGIBLE`.
- **Income Disqualification**: If `scheme.maxAnnualIncome` exists and `profile.annualIncome > scheme.maxAnnualIncome`, score = 0, status = `NOT_ELIGIBLE`.
- **State Disqualification**: If `scheme.stateId != "ALL"` and `profile.state != scheme.stateId`, score = 0, status = `NOT_ELIGIBLE`.
- **Gender Disqualification**: If `scheme.genders` is defined and does not contain `profile.gender` (and profile.gender != "all"), score = 0, status = `NOT_ELIGIBLE`.

### Step 2: Scoring Weights (Total 100 Points)
- **Occupation Match**: 35 Points (Exact or sector matching)
- **Income Bracket Match**: 25 Points (Income ceiling compliance)
- **Age Range Match**: 20 Points (Age band eligibility)
- **Geographic Match**: 20 Points (State / Central scheme applicability)

### Step 3: Match Level Categorization
- `score >= 80` -> `STRONG` (`ELIGIBLE`)
- `score >= 50` -> `POTENTIAL` (`ELIGIBLE`)
- `score > 0`  -> `MORE_INFO` (`NEEDS_INFORMATION`)
- `score == 0` -> `INELIGIBLE` (`NOT_ELIGIBLE`)

---

## Criteria Breakdown Structure
Both Web and Android return:
- `criteriaBreakdown.age: Boolean`
- `criteriaBreakdown.income: Boolean`
- `criteriaBreakdown.occupation: Boolean`
- `criteriaBreakdown.location: Boolean`
- `criteriaBreakdown.gender: Boolean`
- `criteriaBreakdown.land: Boolean`
- `whyMeEnglish: List<String>`
- `whyMeRegional: List<String>`
- `matchedPoints: List<String>`
- `pendingPoints: List<String>`

