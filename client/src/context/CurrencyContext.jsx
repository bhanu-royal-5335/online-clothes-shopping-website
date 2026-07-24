import { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', rate: 1, label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', rate: 0.012, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0095, label: 'GBP (£)' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    return saved && CURRENCIES[saved] ? saved : 'INR';
  });

  const changeCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrency(code);
      localStorage.setItem('selectedCurrency', code);
    }
  };

  const formatPrice = (amountInINR) => {
    const num = Number(amountInINR) || 0;
    const active = CURRENCIES[currency] || CURRENCIES.INR;
    const converted = num * active.rate;

    return `${active.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyDetails: CURRENCIES[currency],
        changeCurrency,
        formatPrice,
        CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
