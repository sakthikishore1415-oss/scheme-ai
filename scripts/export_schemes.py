#!/usr/bin/env python3
"""
Arivom Thittam - Unified Scheme & Requirements JSON Exporter Pipeline
=====================================================================
Compiles, validates, and exports all Central and State government schemes
with their detailed eligibility criteria, benefits, and required documents
into standardized JSON format for Web, Public API, and Android assets.
"""

import os
import sys
import json
from pathlib import Path

# Paths configuration
ROOT_DIR = Path(__file__).resolve().parent.parent
SOURCE_JSON = ROOT_DIR / "packages" / "scheme-data" / "src" / "all_india_schemes.json"

TARGET_OUTPUTS = [
    ROOT_DIR / "packages" / "scheme-data" / "src" / "all_schemes.json",
    ROOT_DIR / "apps" / "web" / "src" / "data" / "all_schemes.json",
    ROOT_DIR / "apps" / "web" / "public" / "data" / "schemes.json",
    ROOT_DIR / "apps" / "android" / "app" / "src" / "main" / "assets" / "schemes.json",
]

def load_schemes(source_path: Path):
    if not source_path.exists():
        print(f"❌ Error: Source file not found at {source_path}")
        sys.exit(1)
    
    with open(source_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def validate_and_normalize_scheme(s: dict, index: int) -> dict:
    """Ensure consistent schema fields and requirements format across all schemes."""
    scheme_id = s.get("id") or f"scheme-{index}"
    name = s.get("name", "Untitled Scheme")
    
    # Normalized structure
    normalized = {
        "id": scheme_id,
        "name": name,
        "nativeName": s.get("nativeName", name),
        "authority": s.get("authority", "Government of India"),
        "department": s.get("department", "Public Welfare"),
        "schemeType": s.get("schemeType", "central"),
        "stateId": s.get("stateId", "ALL"),
        "state": s.get("state", "All India"),
        "category": s.get("category", "general_welfare"),
        "summarySimple": s.get("summarySimple", ""),
        "benefits": {
            "amount": s.get("benefits", {}).get("amount", "Financial Support"),
            "frequency": s.get("benefits", {}).get("frequency", "Periodic"),
            "type": s.get("benefits", {}).get("type", "cash_transfer"),
            "shortSummary": s.get("benefits", {}).get("shortSummary", ""),
            "detailedBenefit": s.get("benefits", {}).get("detailedBenefit", "")
        },
        "eligibility": {
            "minAge": s.get("eligibility", {}).get("minAge"),
            "maxAge": s.get("eligibility", {}).get("maxAge"),
            "allowedGenders": s.get("eligibility", {}).get("allowedGenders", ["any"]),
            "allowedMaritalStatus": s.get("eligibility", {}).get("allowedMaritalStatus", ["any"]),
            "allowedCommunities": s.get("eligibility", {}).get("allowedCommunities", ["any"]),
            "maxAnnualIncome": s.get("eligibility", {}).get("maxAnnualIncome"),
            "requiresLandHoldingMaxAcres": s.get("eligibility", {}).get("requiresLandHoldingMaxAcres"),
            "allowedOccupations": s.get("eligibility", {}).get("allowedOccupations", ["all"]),
            "requiresBPL": s.get("eligibility", {}).get("requiresBPL", False),
            "applicableStates": s.get("eligibility", {}).get("applicableStates", ["ALL"]),
            "targetCategories": s.get("eligibility", {}).get("targetCategories", [s.get("category", "general_welfare")])
        },
        "documents": s.get("documents", [
            {"id": "doc-aadhaar", "name": "Aadhaar Card", "isMandatory": True, "description": "Mandatory identity proof linked with mobile number"}
        ]),
        "applicationSteps": s.get("applicationSteps", [
            "Visit the official portal or nearest e-Sevai / CSC centre.",
            "Submit the application form with required identity and eligibility proofs.",
            "Track application status using reference number."
        ]),
        "applicationUrl": s.get("applicationUrl", "https://www.india.gov.in"),
        "offlineApplicationCenter": s.get("offlineApplicationCenter", "CSC / e-Sevai / Grama One Center / District Collectorate"),
        "helpline": s.get("helpline", "1800-11-0001")
    }
    
    return normalized

def main():
    print("🏛️  Arivom Thittam — Schemes & Requirements JSON Export Pipeline")
    print("=" * 65)
    
    schemes_raw = load_schemes(SOURCE_JSON)
    normalized_schemes = [validate_and_normalize_scheme(s, i) for i, s in enumerate(schemes_raw)]
    
    # Sort schemes: Central first, then alphabetical
    normalized_schemes.sort(key=lambda x: (x["stateId"] != "ALL", x["stateId"], x["name"]))
    
    formatted_json = json.dumps(normalized_schemes, indent=2, ensure_ascii=False)
    
    # Write to all destinations
    for target in TARGET_OUTPUTS:
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(formatted_json)
        print(f"✅ Exported: {target.relative_to(ROOT_DIR)} ({len(normalized_schemes)} schemes, {len(formatted_json.encode('utf-8')) / 1024:.1f} KB)")
    
    # Print Statistics Breakdown
    categories = {}
    states = {}
    for s in normalized_schemes:
        cat = s["category"]
        st = s["state"]
        categories[cat] = categories.get(cat, 0) + 1
        states[st] = states.get(st, 0) + 1

    print("\n📊 Schemes Summary by Category:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"   • {cat:<22}: {count} schemes")

    print("\n📍 Schemes Summary by Jurisdiction:")
    for st, count in sorted(states.items(), key=lambda x: -x[1]):
        print(f"   • {st:<22}: {count} schemes")

    print("\n🎉 Scheme JSON export pipeline completed successfully!")

if __name__ == "__main__":
    main()

