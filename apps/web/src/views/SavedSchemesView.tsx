import React from 'react';
import { useApp } from '../context/AppContext';
import { SchemeCard } from '../components/SchemeCard';
import {
  Bookmark,
  FileCheck2,
  Printer,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FolderHeart,
} from 'lucide-react';

export const SavedSchemesView: React.FC = () => {
  const { savedSchemeIds, activeMatches, userDocuments, setActiveTab, uiStrings, selectedVoiceLanguageId } = useApp();

  const savedMatches = activeMatches.filter((m) => savedSchemeIds.includes(m.scheme.id));

  // Compute document readiness
  const totalRequiredDocs = Array.from(
    new Set(savedMatches.flatMap((m) => m.scheme.documents?.map((d) => d.name) || []))
  );
  const readyDocsCount = totalRequiredDocs.filter((d) => userDocuments[d]).length;
  const readinessPercentage =
    totalRequiredDocs.length > 0
      ? Math.round((readyDocsCount / totalRequiredDocs.length) * 100)
      : 0;

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c5c6d0]/60 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-300 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 fill-rose-600" />
              SAVED CITIZEN PORTFOLIO
            </span>
            <span className="text-xs text-[#757780] font-mono">
              {savedMatches.length} Schemes Bookmarked
            </span>
          </div>

          <div className="space-y-0.5 mt-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#092554] tracking-tight">
              {uiStrings.navSaved}
            </h1>
            {selectedVoiceLanguageId !== 'en' && (
              <p className="text-xs font-bold text-[#757780] uppercase tracking-wider">
                Saved Schemes & Application Checklist
              </p>
            )}
          </div>

          <p className="text-xs text-[#44464f] mt-1">
            Your shortlisted entitlements ready for submission at e-Seva / CSC offices.
          </p>
        </div>

        {savedMatches.length > 0 && (
          <button
            id="print-summary-btn"
            onClick={handlePrintSummary}
            className="px-4 py-2.5 rounded-2xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE SUMMARY</span>
          </button>
        )}
      </div>

      {savedMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#c5c6d0]/60 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f2f3fa] text-[#757780] flex items-center justify-center">
            <FolderHeart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#191c1e]">
              சேமிக்கப்பட்ட திட்டங்கள் இல்லை
            </h3>
            <p className="text-xs text-[#757780] max-w-md mx-auto leading-relaxed">
              Bookmark schemes from your matches or explore categories to build a personalized application checklist.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="px-6 py-3 rounded-2xl bg-[#00462d] hover:bg-[#002d1c] text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{uiStrings.browseCatalogBtn}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Document Readiness Progress Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c5c6d0]/60 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#00462d]" />
                <div>
                  <h3 className="font-extrabold text-sm text-[#191c1e]">
                    Overall Document Readiness
                  </h3>
                  <p className="text-xs text-[#757780]">
                    {readyDocsCount} of {totalRequiredDocs.length} mandatory application documents verified
                  </p>
                </div>
              </div>
              <span className="text-base font-black text-[#00462d]">
                {readinessPercentage}%
              </span>
            </div>

            <div className="w-full bg-[#f2f3fa] h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#00462d] to-[#94f6c4] rounded-full transition-all duration-500"
                style={{ width: `${readinessPercentage}%` }}
              />
            </div>
          </div>

          {/* Shortlisted Schemes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedMatches.map((res) => (
              <SchemeCard key={res.scheme.id} matchResult={res} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
