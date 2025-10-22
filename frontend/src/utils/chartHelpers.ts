// Generate color palette
export const generateColorPalette = (count: number): string[] => {
  const baseColors = [
    '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
    '#00BCD4', '#FFEB3B', '#E91E63', '#3F51B5', '#8BC34A',
    '#FF5722', '#607D8B', '#FFC107', '#795548', '#9E9E9E'
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors if needed
  const colors = [...baseColors];
  while (colors.length < count) {
    const hue = (colors.length * 137.508) % 360; // Golden angle
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
};

// Get color for transaction type
export const getTransactionTypeColor = (type: 'INCOME' | 'EXPENSE'): string => {
  return type === 'INCOME' ? '#4CAF50' : '#F44336';
};

// Get color for budget utilization
export const getBudgetUtilizationColor = (percentage: number): string => {
  if (percentage < 50) return '#4CAF50'; // Green
  if (percentage < 75) return '#FFC107'; // Yellow
  if (percentage < 90) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

// Format chart data
export const formatChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map((item) => ({
    name: item[xKey],
    value: item[yKey],
  }));
};

// Calculate chart domain
export const calculateChartDomain = (data: number[]): [number, number] => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1;
  return [Math.floor(min - padding), Math.ceil(max + padding)];
};

// Format tooltip value
export const formatTooltipValue = (value: number, prefix: string = '$'): string => {
  return `${prefix}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

