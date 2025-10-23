import React, { useState } from 'react';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import {
  Button,
  Text,
  Select,
  Option,
  makeStyles,
  tokens,
  shorthands
} from '@fluentui/react-components';
import {
  ChevronDown24Regular
} from '@fluentui/react-icons';
import './CurrencySwitcher.css';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  }
});

const CurrencySwitcher: React.FC = () => {
  const styles = useStyles();
  const { currency, setCurrency } = useCurrency();

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = event.target.value;
    const newCurrency = CURRENCIES.find(c => c.code === selectedCode);
    if (newCurrency) {
      setCurrency(newCurrency);
    }
  };

  return (
    <div className={styles.container}>
      <Text className={styles.label}>Currency</Text>
      <Select
        value={currency.code}
        onChange={handleCurrencyChange}
        style={{ width: '100%' }}
      >
        {CURRENCIES.map((curr) => (
          <Option key={curr.code} value={curr.code} text={`${curr.symbol} ${curr.code} - ${curr.name}`}>
            {curr.symbol} {curr.code} - {curr.name}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default CurrencySwitcher;
