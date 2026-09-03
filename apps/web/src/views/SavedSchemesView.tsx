import React from 'react';
import { useApp } from '../context/AppContext';
import { SchemeCard } from '../components/SchemeCard';
import {
  Bookmark,
  FileCheck2,
  Printer,
  Sparkles,
  FolderHeart,
} from 'lucide-react';

export const SavedSchemesView: React.FC = () => {
  const { savedSchemeIds, activeMatches, userDocuments, setActiveTab, t } = useApp();

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
      <div className="bg-[#4a1f2d] text-white rounded-3xl p-6 sm:p-8 border border-[#6b3548] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#6b3548] text-[#ffd9e1] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#e8e1dc]/30 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 fill-[#c8a96b] text-[#c8a96b]" />
              {t('saved.title')}
            </span>
            <span className="text-xs text-[#c8a96b] font-mono font-bold">
              {savedMatches.length} Shortlisted
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            {t('saved.title')}
          </h1>

          <p className="text-xs sm:text-sm text-[#ffd9e1] mt-1">
            {t('saved.subtitle')}
          </p>
        </div>

        {savedMatches.length > 0 && (
          <button
            id="print-summary-btn"
            onClick={handlePrintSummary}
            className="px-5 py-2.5 rounded-xl bg-[#c8a96b] hover:bg-[#e3c282] text-[#310a18] font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t('saved.printBtn')}</span>
          </button>
        )}
      </div>

      {savedMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#e8e1dc] text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] text-[#4a1f2d] flex items-center justify-center">
            <FolderHeart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#21191d]">
              {t('saved.emptyTitle')}
            </h3>
            <p className="text-xs text-[#756a6f] max-w-md mx-auto leading-relaxed">
              {t('saved.emptySubtitle')}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="px-6 py-3 rounded-xl bg-[#4a1f2d] hover:bg-[#310a18] text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#c8a96b]" />
            <span>{t('saved.discoverBtn')}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Document Readiness Progress Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e1dc] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#eedfe4] text-[#4a1f2d] flex items-center justify-center font-bold shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#21191d]">
                    {t('saved.readinessTitle')}
                  </h3>
                  <p className="text-xs text-[#756a6f]">
                    {readyDocsCount} of {totalRequiredDocs.length} {t('saved.readinessSubtitle')}
                  </p>
                </div>
              </div>
              <span className="text-base font-bold text-[#4a1f2d]">
                {readinessPercentage}%
              </span>
            </div>

            <div className="w-full bg-[#faf8f3] border border-[#e8e1dc] h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#4a1f2d] to-[#c8a96b] rounded-full transition-all duration-500"
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
