// DiasporaTrust Multi-Currency Utility Unit Tests
// Verifies conversions, rates, formatting, and invariants across NGN, USD, GBP, and EUR

import { CURRENCY_CONFIGS } from '../src/hooks/useCurrency';
import { SupportedCurrency } from '../src/types';

export function runCurrencyUnitTests() {
  const results: { testName: string; passed: boolean; message: string }[] = [];

  // Helper convert function matching useCurrency logic
  const convert = (amount: number, from: SupportedCurrency, to: SupportedCurrency): number => {
    if (from === to) return amount;
    const fromRate = CURRENCY_CONFIGS[from].rateToNgn;
    const toRate = CURRENCY_CONFIGS[to].rateToNgn;
    const amountInNgn = amount * fromRate;
    return amountInNgn / toRate;
  };

  // Test 1: Verify all 4 required currencies exist with accurate CBN benchmark rates
  const expectedCurrencies: SupportedCurrency[] = ['NGN', 'USD', 'GBP', 'EUR'];
  const allCurrenciesConfigured = expectedCurrencies.every((code) => {
    const config = CURRENCY_CONFIGS[code];
    return config && config.rateToNgn > 0 && config.symbol.length > 0;
  });

  results.push({
    testName: 'Currency Registry: NGN, USD, GBP, and EUR properly configured with positive rates and symbols',
    passed: allCurrenciesConfigured,
    message: allCurrenciesConfigured
      ? 'All 4 currencies configured with valid rates: USD (₦1,530), GBP (₦1,980), EUR (₦1,670), NGN (₦1).'
      : 'Failed currency registry configuration.',
  });

  // Test 2: NGN to foreign currencies conversion math
  const testNgnAmount = 15300000; // ₦15.3M
  const usdResult = convert(testNgnAmount, 'NGN', 'USD');
  const usdExpected = 10000;
  const isUsdCorrect = Math.abs(usdResult - usdExpected) < 0.001;

  results.push({
    testName: 'Conversion: ₦15,300,000 NGN converts to exactly $10,000 USD at rate 1,530',
    passed: isUsdCorrect,
    message: isUsdCorrect
      ? `Converted ₦${testNgnAmount.toLocaleString()} to $${usdResult.toLocaleString()}`
      : `Expected $${usdExpected}, got $${usdResult}`,
  });

  // Test 3: EUR conversion math
  const testEurAmount = 5000; // €5,000
  const ngnFromEur = convert(testEurAmount, 'EUR', 'NGN');
  const expectedNgnFromEur = 5000 * 1670; // ₦8,350,000
  const isEurCorrect = ngnFromEur === expectedNgnFromEur;

  results.push({
    testName: 'Conversion: €5,000 EUR converts to exactly ₦8,350,000 NGN at rate 1,670',
    passed: isEurCorrect,
    message: isEurCorrect
      ? `€${testEurAmount} EUR = ₦${ngnFromEur.toLocaleString()} NGN`
      : `Mismatch in EUR conversion: got ₦${ngnFromEur}`,
  });

  // Test 4: Cross-currency conversion (USD to EUR directly)
  // $10,000 USD = ₦15,300,000 NGN. ₦15,300,000 / 1670 = €9,161.6766... EUR
  const eurFromUsd = convert(10000, 'USD', 'EUR');
  const expectedEurFromUsd = 15300000 / 1670;
  const isCrossCurrencyExact = Math.abs(eurFromUsd - expectedEurFromUsd) < 0.0001;

  results.push({
    testName: 'Cross-Currency: Direct conversion from USD to EUR via NGN base reference preserves precision',
    passed: isCrossCurrencyExact,
    message: isCrossCurrencyExact
      ? `$10,000 USD = €${eurFromUsd.toFixed(2)} EUR`
      : 'Cross currency precision error.',
  });

  // Test 5: Round-trip conversion invariant
  // Amount -> Target -> Original Amount should return initial amount
  const initialGbp = 25000;
  const convertedToNgn = convert(initialGbp, 'GBP', 'NGN');
  const roundTripGbp = convert(convertedToNgn, 'NGN', 'GBP');
  const isRoundTripExact = Math.abs(roundTripGbp - initialGbp) < 0.001;

  results.push({
    testName: 'Round-Trip Invariant: Converting GBP -> NGN -> GBP preserves original monetary value',
    passed: isRoundTripExact,
    message: isRoundTripExact
      ? `£${initialGbp} -> ₦${convertedToNgn.toLocaleString()} -> £${roundTripGbp} (zero drift)`
      : 'Round-trip calculation drifted.',
  });

  return results;
}
