import moment from "moment";

export function parseDate(dateStr: string): Date | null {
  const parsedDate = new Date(dateStr);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

const formats = ["YYYY-MM-DD", "YYYY/MM/DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYYMMDD", "YYYY.MM.DD", "MM.DD.YYYY", "DD.MM.YYYY"];

export function isDateStringValid(dateStr: string): boolean {
  // Check if the date string matches any of the formats
  const valid = formats.some((format) => moment(dateStr, format, true).isValid());
  return valid;
}

export function isValidYearMonthDay(str: string): { isValid: boolean; type?: 'year' | 'month' | 'day' } {
  const num = parseInt(str, 10);

  if (isNaN(num)) {
    return { isValid: false };
  }

  if (num >= 1000 && num <= 9999) {
    return { isValid: true, type: 'year' };
  }

  if (num >= 1 && num <= 12) {
    return { isValid: true, type: 'month' };
  }

  if (num >= 1 && num <= 31) {
    return { isValid: true, type: 'day' };
  }

  return { isValid: false };
}