import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'SOS' | 'ETB' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
}

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  SOS: 570,  // 1 USD = 570 Somali Shillings approx
  ETB: 120,  // 1 USD = 120 Ethiopian Birr approx
  EUR: 0.92  // 1 USD = 0.92 Euros approx
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  SOS: 'Sh.So.',
  ETB: 'Br',
  EUR: '€'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('guulwade_currency');
    return (saved as Currency) || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('guulwade_currency', currency);
  }, [currency]);

  const convertPrice = (amountInUSD: number): number => {
    return Math.round(amountInUSD * EXCHANGE_RATES[currency]);
  };

  const formatPrice = (amountInUSD: number): string => {
    const converted = convertPrice(amountInUSD);
    const symbol = CURRENCY_SYMBOLS[currency];
    if (currency === 'SOS' || currency === 'ETB') {
      return `${converted.toLocaleString()} ${symbol}`;
    }
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
}
