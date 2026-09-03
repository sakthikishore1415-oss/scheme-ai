import React from 'react';

interface DualTextDisplayProps {
  native: string;
  en: string;
  className?: string;
  nativeClassName?: string;
  enClassName?: string;
  layout?: 'stacked' | 'inline';
}

export const DualTextDisplay: React.FC<DualTextDisplayProps> = ({
  native,
  en,
  className = '',
  nativeClassName = 'font-bold',
  enClassName = 'text-[11px] opacity-80 leading-tight',
  layout = 'stacked',
}) => {
  const isSame = native.trim().toLowerCase() === en.trim().toLowerCase();

  if (isSame) {
    return <span className={`${nativeClassName} ${className}`}>{native}</span>;
  }

  if (layout === 'inline') {
    return (
      <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
        <span className={nativeClassName}>{native}</span>
        <span className={enClassName}>({en})</span>
      </span>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <span className={nativeClassName}>{native}</span>
      <span className={enClassName}>{en}</span>
    </div>
  );
};

