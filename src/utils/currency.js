import { storageService } from '../services/storageService';

export const formatCurrency = (amount, currencySymbol) => {
  let symbol = currencySymbol;
  if (symbol === undefined || symbol === null || symbol === '') {
    try {
      symbol = storageService.getCurrency();
    } catch (_) {
      symbol = '$';
    }
  }
  if (!symbol) symbol = '$';

  // Add spacing after multi-letter currency codes (e.g., "AED 5,000", "SAR 1,000", "USD 500")
  const trimmed = symbol.trim();
  const separator = (/^[A-Za-z]{2,}$/.test(trimmed)) ? ' ' : '';

  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${trimmed}${separator}0`;
  }

  return `${trimmed}${separator}${Number(amount).toLocaleString('en-US')}`;
};

