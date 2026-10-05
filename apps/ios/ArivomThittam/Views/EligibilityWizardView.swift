import SwiftUI

public struct EligibilityWizardView: View {
    @Environment(\.presentationMode) var presentationMode
    @EnvironmentObject var appState: AppState
    @ObservedObject var translationManager = TranslationManager.shared

    @State private var age: Int = 0
    @State private var gender: String = "all"
    @State private var state: String = "TN"
    @State private var occupation: String = "other"
    @State private var annualIncome: Double = 0
    @State private var landHoldingAcres: Double = 0.0
    @State private var disability: Bool = false
    @State private var showingResults = false

    private let occupations = [
        "farmer", "student", "unemployed", "daily_wage", "self_employed", "artisan", "homemaker", "other"
    ]

    private let states = [
        ("TN", "Tamil Nadu"),
        ("KL", "Kerala"),
        ("KA", "Karnataka"),
        ("AP", "Andhra Pradesh"),
        ("ALL", "All India")
    ]

    public init() {}

    public var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Basic Details")) {
                    Stepper(value: $age, in: 0...100) {
                        HStack {
                            Text("Age:")
                            Spacer()
                            Text("\(age) years")
                                .bold()
                                .foregroundColor(.accentColor)
                        }
                    }

                    Picker("Gender", selection: $gender) {
                        Text("Female").tag("female")
                        Text("Male").tag("male")
                        Text("Transgender").tag("transgender")
                        Text("All / Unspecified").tag("all")
                    }

                    Picker("State of Residence", selection: $state) {
                        ForEach(states, id: \.0) { item in
                            Text(item.1).tag(item.0)
                        }
                    }
                }

                Section(header: Text("Livelihood & Economic Background")) {
                    Picker("Primary Occupation", selection: $occupation) {
                        ForEach(occupations, id: \.self) { occ in
                            Text(occ.replacingOccurrences(of: "_", with: " ").capitalized).tag(occ)
                        }
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("Annual Family Income:")
                            Spacer()
                            Text("₹\(Int(annualIncome).formatted())")
                                .bold()
                                .foregroundColor(.accentColor)
                        }
                        Slider(value: $annualIncome, in: 0...500000, step: 10000)
                    }

                    if occupation == "farmer" {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("Land Holding (Acres):")
                                Spacer()
                                Text(String(format: "%.1f Acres", landHoldingAcres))
                                    .bold()
                                    .foregroundColor(.accentColor)
                            }
                            Slider(value: $landHoldingAcres, in: 0...10, step: 0.5)
                        }
                    }

                    Toggle("Differently Abled (PwD)", isOn: $disability)
                }

                Section {
                    Button(action: {
                        // Update profile in AppState
                        appState.citizenProfile = CitizenProfile(
                            name: appState.citizenProfile.name,
                            age: age,
                            gender: gender,
                            state: state,
                            district: appState.citizenProfile.district,
                            occupation: occupation,
                            annualIncome: Int64(annualIncome),
                            landHoldingAcres: landHoldingAcres,
                            disability: disability
                        )

                        // Run deterministic engine
                        appState.recalculateEligibility(with: DefaultSchemes.all)
                        showingResults = true
                    }) {
                        HStack {
                            Spacer()
                            Image(systemName: "sparkles")
                            Text("Calculate Welfare Entitlements")
                                .font(.system(size: 16, weight: .bold))
                            Spacer()
                        }
                        .foregroundColor(.white)
                        .padding(.vertical, 8)
                    }
                    .listRowBackground(Color.accentColor)
                }
            }
            .navigationTitle("Eligibility Check")
            .navigationBarItems(trailing: Button("Done") {
                presentationMode.wrappedValue.dismiss()
            })
            .sheet(isPresented: $showingResults) {
                EligibilityResultView(results: appState.eligibilityResults)
            }
            .onAppear {
                self.age = appState.citizenProfile.age
                self.gender = appState.citizenProfile.gender
                self.state = appState.citizenProfile.state
                self.occupation = appState.citizenProfile.occupation
                self.annualIncome = Double(appState.citizenProfile.annualIncome)
                self.landHoldingAcres = appState.citizenProfile.landHoldingAcres ?? 0.0
                self.disability = appState.citizenProfile.disability
            }
        }
    }
}
