import React, { useState } from 'react';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import './CurrencySwitcher.css';

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = (newCurrency: typeof CURRENCIES[0]) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="currency-switcher">
      <button 
        className="currency-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change currency"
      >
        <span className="currency-symbol">{currency.symbol}</span>
        <span className="currency-code">{currency.code}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="currency-dropdown">
          <div className="currency-dropdown-header">
            <h4>Select Currency</h4>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close currency selector"
            >
              ×
            </button>
          </div>
          <div className="currency-list">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                className={`currency-option ${curr.code === currency.code ? 'selected' : ''}`}
                onClick={() => handleCurrencyChange(curr)}
              >
                <span className="currency-symbol">{curr.symbol}</span>
                <div className="currency-info">
                  <span className="currency-code">{curr.code}</span>
                  <span className="currency-name">{curr.name}</span>
                </div>
                {curr.code === currency.code && (
                  <span className="checkmark">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySwitcher;
