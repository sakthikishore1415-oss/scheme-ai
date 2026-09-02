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
  const { savedSchemeIds, activeMatches, userDocuments, setActiveTab } = useApp();

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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-300 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 fill-rose-600" />
              SAVED CITIZEN PORTFOLIO
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {savedMatches.length} Schemes Bookmarked
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Saved Schemes & Application Checklist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your shortlisted entitlements ready for submission at e-Seva / CSC offices.
          </p>
        </div>

        {savedMatches.length > 0 && (
          <button
            id="print-summary-btn"
            onClick={handlePrintSummary}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE SUMMARY</span>
          </button>
        )}
      </div>

      {savedMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <FolderHeart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              You haven't saved any schemes yet.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Bookmark schemes from your matches or explore categories to build a personalized application checklist for your local e-Seva center.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>DISCOVER SCHEMES</span>
          </button>
        </div>
      ) : (
        <>
          {/* Document Readiness Progress Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Overall Document Readiness
                  </h3>
                  <p className="text-xs text-slate-500">
                    {readyDocsCount} of {totalRequiredDocs.length} mandatory documents verified in your checklist.
                  </p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-700">{readinessPercentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-linear-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${readinessPercentage}%` }}
              ></div>
            </div>

            {/* Document list checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
              {totalRequiredDocs.map((doc, idx) => {
                const isReady = userDocuments[doc];
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isReady ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-medium text-xs truncate max-w-[80%]">{doc}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isReady ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isReady ? 'READY' : 'PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Saved Scheme Cards List */}
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
