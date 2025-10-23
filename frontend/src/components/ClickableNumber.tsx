import React, { useState } from 'react';
import { formatCurrency, formatCompactCurrency, formatCompactNumber } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';

interface ClickableNumberProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  showCurrency?: boolean;
  compactThreshold?: number;
}

const ClickableNumber: React.FC<ClickableNumberProps> = ({
  value,
  className,
  style,
  showCurrency = true,
  compactThreshold = 10000
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currency } = useCurrency();
  const currencyCode = currency.code;
  
  const shouldCompact = Math.abs(value) >= compactThreshold;
  const displayValue = isExpanded || !shouldCompact 
    ? (showCurrency ? formatCurrency(value, currencyCode) : value.toLocaleString())
    : (showCurrency ? formatCompactCurrency(value, currencyCode) : formatCompactNumber(value));

  const handleClick = () => {
    if (shouldCompact) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <span
      className={className}
      style={{
        cursor: shouldCompact ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        ...style
      }}
      onClick={handleClick}
      title={shouldCompact ? `Click to ${isExpanded ? 'show compact' : 'show full'} number` : undefined}
    >
      {displayValue}
    </span>
  );
};

export default ClickableNumber;
