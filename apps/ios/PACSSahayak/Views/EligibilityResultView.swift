import SwiftUI

public struct EligibilityResultView: View {
    public let results: [EligibilityResult]
    @Environment(\.presentationMode) var presentationMode
    @State private var filter: String = "ALL"

    public init(results: [EligibilityResult]) {
        self.results = results
    }

    public var filteredResults: [EligibilityResult] {
        switch filter {
        case "STRONG":
            return results.filter { $0.matchLevel == .strong }
        case "ELIGIBLE":
            return results.filter { $0.status == .eligible }
        default:
            return results
        }
    }

    public var eligibleCount: Int {
        results.filter { $0.status == .eligible }.count
    }

    public var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    // Summary Score Card
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.green)

                        Text("Deterministic Assessment Complete")
                            .font(.system(size: 18, weight: .bold))

                        Text("You qualify for \(eligibleCount) welfare programs based on statutory criteria.")
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(16)
                    .padding(.horizontal, 16)

                    // Filter Picker
                    Picker("Filter Results", selection: $filter) {
                        Text("All (\(results.count))").tag("ALL")
                        Text("Eligible (\(eligibleCount))").tag("ELIGIBLE")
                        Text("Strong Matches").tag("STRONG")
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding(.horizontal, 16)

                    // Results List
                    LazyVStack(spacing: 14) {
                        ForEach(filteredResults) { result in
                            NavigationLink(destination: SchemeDetailView(scheme: result.scheme, eligibilityResult: result)) {
                                SchemeCardView(scheme: result.scheme, eligibilityResult: result)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.horizontal, 16)
                }
                .padding(.vertical, 16)
            }
            .navigationTitle("Eligible Schemes")
            .navigationBarItems(trailing: Button("Close") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
}
