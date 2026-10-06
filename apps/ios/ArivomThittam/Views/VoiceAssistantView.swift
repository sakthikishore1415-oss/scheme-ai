import SwiftUI

public struct VoiceMessage: Identifiable, Equatable {
    public let id = UUID()
    public let text: String
    public let isUser: Bool
    public let timestamp: Date = Date()
}

public struct VoiceAssistantView: View {
    @ObservedObject var translationManager = TranslationManager.shared
    @State private var inputText: String = ""
    @State private var isListening: Bool = false
    @State private var messages: [VoiceMessage] = [
        VoiceMessage(
            text: "வணக்கம்! நான் உங்கள் PACS Sahayak குரல் உதவியாளர். அரசு நலத்திட்டங்கள், உதவித்தொகை, மானியம் பற்றி எதை வேண்டுமானாலும் கேளுங்கள்.",
            isUser: false
        )
    ]

    private let sampleQueries = [
        "மகளிர் உரிமைத் திட்டம் தகுதி என்ன?",
        "விவசாயிகளுக்கான உதவித்தொகை திட்டங்கள்",
        "Ayushman Bharat health insurance details",
        "Free housing assistance in rural areas"
    ]

    public init() {}

    public var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Chat Message Stream
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(messages) { msg in
                                HStack {
                                    if msg.isUser {
                                        Spacer()
                                        Text(msg.text)
                                            .font(.system(size: 15))
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 10)
                                            .background(Color.accentColor)
                                            .foregroundColor(.white)
                                            .cornerRadius(16)
                                            .padding(.leading, 40)
                                    } else {
                                        HStack(alignment: .top, spacing: 8) {
                                            Image(systemName: "sparkles")
                                                .foregroundColor(.accentColor)
                                                .font(.system(size: 16))
                                                .padding(.top, 4)

                                            Text(msg.text)
                                                .font(.system(size: 15))
                                                .padding(.horizontal, 14)
                                                .padding(.vertical, 10)
                                                .background(Color(UIColor.secondarySystemBackground))
                                                .foregroundColor(.primary)
                                                .cornerRadius(16)
                                        }
                                        .padding(.trailing, 40)
                                        Spacer()
                                    }
                                }
                                .id(msg.id)
                            }
                        }
                        .padding(16)
                    }
                    .onChange(of: messages.count) { _ in
                        if let last = messages.last {
                            withAnimation {
                                proxy.scrollTo(last.id, anchor: .bottom)
                            }
                        }
                    }
                }

                // Quick Prompt Chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(sampleQueries, id: \.self) { query in
                            Button(action: {
                                sendQuery(query)
                            }) {
                                Text(query)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.accentColor)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.accentColor.opacity(0.1))
                                    .cornerRadius(12)
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                }

                Divider()

                // Input Bar with Mic Button
                HStack(spacing: 12) {
                    TextField(translationManager.localized("voice_prompt_placeholder"), text: $inputText)
                        .font(.system(size: 15))
                        .padding(10)
                        .background(Color(UIColor.secondarySystemBackground))
                        .cornerRadius(20)

                    if !inputText.isEmpty {
                        Button(action: {
                            sendQuery(inputText)
                            inputText = ""
                        }) {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 28))
                                .foregroundColor(.accentColor)
                        }
                    } else {
                        Button(action: {
                            toggleListening()
                        }) {
                            Image(systemName: isListening ? "waveform.circle.fill" : "mic.circle.fill")
                                .font(.system(size: 32))
                                .foregroundColor(isListening ? .red : .accentColor)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
            .navigationTitle(translationManager.localized("tab_voice"))
        }
    }

    private func toggleListening() {
        isListening.toggle()
        if isListening {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                if self.isListening {
                    self.isListening = false
                    self.sendQuery("கலைஞர் மகளிர் உரிமைத் திட்டத்திற்கு என்னென்ன ஆவணங்கள் தேவை?")
                }
            }
        }
    }

    private func sendQuery(_ query: String) {
        messages.append(VoiceMessage(text: query, isUser: true))

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            let answer = self.generateAnswer(for: query)
            self.messages.append(VoiceMessage(text: answer, isUser: false))
        }
    }

    private func generateAnswer(for query: String) -> String {
        let q = query.lowercased()
        if q.contains("மகளிர்") || q.contains("magalir") || q.contains("women") {
            return "கலைஞர் மகளிர் உரிமைத் திட்டம்: குடும்ப பெண் தலைவர்களுக்கு மாதம் ₹1,000 உரிமைத்தொகை வழங்கப்படுகிறது. தகுதிகள்: வயது 21+, குடும்ப ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள். தேவையானவை: ஸ்மார்ட் ரேஷன் கார்டு, ஆதார் அட்டை, மற்றும் மின் இணைப்பு எண்."
        } else if q.contains("விவசாய") || q.contains("kisan") || q.contains("farmer") {
            return "PM-KISAN திட்டம்: நிலம் வைத்துள்ள விவசாய குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 (மூன்று தவணைகளில் ₹2,000) நேரடி வங்கி பரிமாற்றம் செய்யப்படுகிறது. நில உரிமை ஆவணம் (பட்டா/சிட்டா) மற்றும் ஆதார் கார்டு தேவை."
        } else if q.contains("மருத்துவம்") || q.contains("காப்பீடு") || q.contains("health") || q.contains("ayushman") || q.contains("cmchis") {
            return "ஆயுஷ்மான் பாரத் மற்றும் தமிழ்நாடு முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS) மூலம் ஆண்டுக்கு குடும்பத்திற்கு ₹5,00,000 வரை கட்டணமில்லா மருத்துவ சிகிச்சை அனுமதிக்கப்பட்ட மருத்துவமனைகளில் வழங்கப்படுகிறது."
        } else if q.contains("வீடு") || q.contains("housing") || q.contains("awas") {
            return "பிரதமர் ஊரக வீட்டுவசதி திட்டம் (PMAY-G): வீடற்ற ஏழை குடும்பங்களுக்கு நிரந்தர வீடு கட்ட ₹1.20 லட்சம் முதல் ₹1.30 லட்சம் வரை நிதி உதவி வழங்கப்படுகிறது."
        } else {
            return "உங்கள் கேள்வி பதிவு செய்யப்பட்டது. PACS Sahayak தரவுத்தளத்தின்படி, உங்கள் தகுதியைச் சரிபார்க்க 'Eligibility' பிரிவில் உங்கள் சுயவிவரத்தைப் புதுப்பித்து உடனடி முடிவுகளைக் காணலாம்."
        }
    }
}
