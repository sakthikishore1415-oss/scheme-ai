import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchemeCard } from '../components/SchemeCard';
import {
  Bookmark,
  FileCheck2,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SavedSchemesView: React.FC = () => {
  const { savedSchemeIds, activeMatches, userDocuments, setActiveTab } = useApp();

  const savedMatches = activeMatches.filter((m) => savedSchemeIds.includes(m.scheme.id));

  // Compute document readiness
  const totalRequiredDocs = Array.from(
    new Set(savedMatches.flatMap((m) => m.scheme.documents.map((d) => d.name)))
  );
  const readyDocsCount = totalRequiredDocs.filter((d) => userDocuments[d]).length;
  const readinessPercentage =
    totalRequiredDocs.length > 0
      ? Math.round((readyDocsCount / totalRequiredDocs.length) * 100)
      : 100;

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

      {/* Document Readiness Progress Card */}
      {savedMatches.length > 0 && (
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
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-full"
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
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isReady
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="truncate pr-2">{doc}</span>
                  {isReady ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Schemes Cards List */}
      {savedMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedMatches.map((result) => (
            <SchemeCard key={result.scheme.id} matchResult={result} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Saved Schemes Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse eligible government schemes and click the bookmark icon to create your personalized application folder.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>DISCOVER SCHEMES</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
