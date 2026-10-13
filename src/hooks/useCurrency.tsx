import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedCurrency } from '../types';

export type { SupportedCurrency };

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  flag: string;
  rateToNgn: number; // Value of 1 unit in NGN
}

export const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    rateToNgn: 1.0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateToNgn: 1530.0,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rateToNgn: 1980.0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rateToNgn: 1670.0,
  },
};

export interface FormatOptions {
  showCode?: boolean;
  compact?: boolean;
  decimals?: number;
}

export interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  convert: (amount: number, from: SupportedCurrency, to?: SupportedCurrency) => number;
  format: (amount: number, fromCurrency?: SupportedCurrency, options?: FormatOptions) => string;
  formatRaw: (amount: number, currency: SupportedCurrency, options?: FormatOptions) => string;
  allCurrencies: CurrencyConfig[];
  currentConfig: CurrencyConfig;
  benchmarkDate: string;
  benchmarkSource: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode; defaultCurrency?: SupportedCurrency }> = ({
  children,
  defaultCurrency = 'USD',
}) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diasporatrust_currency') as SupportedCurrency;
      if (saved && CURRENCY_CONFIGS[saved]) {
        return saved;
      }
    }
    return defaultCurrency;
  });

  const setCurrency = (c: SupportedCurrency) => {
    if (CURRENCY_CONFIGS[c]) {
      setCurrencyState(c);
      if (typeof window !== 'undefined') {
        localStorage.setItem('diasporatrust_currency', c);
      }
    }
  };

  /**
   * Convert an amount between any two supported currencies
   */
  const convert = (amount: number, from: SupportedCurrency, to?: SupportedCurrency): number => {
    const targetCurrency = to || currency;
    if (from === targetCurrency) return amount;

    // Convert from source currency to base NGN
    const fromRate = CURRENCY_CONFIGS[from]?.rateToNgn || 1.0;
    const amountInNgn = amount * fromRate;

    // Convert from NGN to target currency
    const toRate = CURRENCY_CONFIGS[targetCurrency]?.rateToNgn || 1.0;
    return amountInNgn / toRate;
  };

  /**
   * Format an amount by converting it to the active display currency
   */
  const format = (amount: number, fromCurrency: SupportedCurrency = 'NGN', options?: FormatOptions): string => {
    const targetValue = convert(amount, fromCurrency, currency);
    const config = CURRENCY_CONFIGS[currency];
    return formatValueWithConfig(targetValue, config, options);
  };

  /**
   * Format an amount directly in a given currency without converting
   */
  const formatRaw = (amount: number, rawCurrency: SupportedCurrency, options?: FormatOptions): string => {
    const config = CURRENCY_CONFIGS[rawCurrency] || CURRENCY_CONFIGS.USD;
    return formatValueWithConfig(amount, config, options);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convert,
        format,
        formatRaw,
        allCurrencies: Object.values(CURRENCY_CONFIGS),
        currentConfig: CURRENCY_CONFIGS[currency],
        benchmarkDate: '2026-10-11',
        benchmarkSource: 'Central Bank of Nigeria (CBN) Official Interbank Rate',
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

function formatValueWithConfig(val: number, config: CurrencyConfig, options?: FormatOptions): string {
  const { showCode = false, compact = false, decimals } = options || {};

  if (compact) {
    const abs = Math.abs(val);
    let formattedVal = '';
    if (abs >= 1_000_000_000) {
      formattedVal = `${(val / 1_000_000_000).toFixed(decimals ?? 1)}B`;
    } else if (abs >= 1_000_000) {
      formattedVal = `${(val / 1_000_000).toFixed(decimals ?? 1)}M`;
    } else if (abs >= 1_000) {
      formattedVal = `${(val / 1_000).toFixed(decimals ?? 1)}k`;
    } else {
      formattedVal = val.toLocaleString(undefined, {
        minimumFractionDigits: decimals ?? 0,
        maximumFractionDigits: decimals ?? 2,
      });
    }
    return showCode ? `${config.symbol}${formattedVal} ${config.code}` : `${config.symbol}${formattedVal}`;
  }

  // Standard full formatting with commas
  const formattedVal = val.toLocaleString(undefined, {
    minimumFractionDigits: decimals !== undefined ? decimals : val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: decimals !== undefined ? decimals : 2,
  });

  return showCode ? `${config.symbol}${formattedVal} ${config.code}` : `${config.symbol}${formattedVal}`;
}

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
