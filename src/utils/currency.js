export const formatCurrency = (amount, currencySymbol = '$') => {
  if (amount === undefined || amount === null || isNaN(amount)) return `${currencySymbol}0`;
  return `${currencySymbol}${Number(amount).toLocaleString('en-US')}`;
};
