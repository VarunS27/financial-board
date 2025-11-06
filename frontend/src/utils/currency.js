// Format currency in INR
export const formatINR = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const symbol = showSymbol ? '₹' : '';
  const sign = amount < 0 ? '-' : '';
  
  return `${sign}${symbol}${formatted}`;
};

// Format large numbers in Indian style (Lakhs/Crores)
export const formatIndianNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '₹0';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 10000000) { // 1 Crore
    return `${sign}₹${(absNum / 10000000).toFixed(2)}Cr`;
  } else if (absNum >= 100000) { // 1 Lakh
    return `${sign}₹${(absNum / 100000).toFixed(2)}L`;
  } else if (absNum >= 1000) { // 1 Thousand
    return `${sign}₹${(absNum / 1000).toFixed(2)}K`;
  }
  
  return `${sign}₹${absNum.toFixed(2)}`;
};

// Format percentage
export const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};