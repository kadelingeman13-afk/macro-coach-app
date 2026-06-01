export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

export const parseHeight = (feet: number, inches: number): string => {
  return `${feet}'${inches}"`;
};

export const formatMacroValue = (value: number): string => {
  return Math.round(value).toString();
};

export const formatCalories = (calories: number): string => {
  return Math.round(calories).toString();
};

export const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const heightToInches = (feet: number, inches: number): number => {
  return feet * 12 + inches;
};

export const inchesToHeight = (totalInches: number): { feet: number; inches: number } => {
  return {
    feet: Math.floor(totalInches / 12),
    inches: totalInches % 12,
  };
};

export const formatWeight = (weight: number): string => {
  return weight.toFixed(1);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const getMacroColor = (percentage: number): string => {
  if (percentage < 80) return '#FF6B6B';
  if (percentage < 100) return '#FFD93D';
  if (percentage < 110) return '#6BCB77';
  return '#FF6B6B';
};

export const getTodayString = (): string => {
  return formatDate(new Date());
};
