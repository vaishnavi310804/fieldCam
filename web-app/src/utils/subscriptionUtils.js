/**
 * Calculates the calendar-month expiry date for a given start date and duration in months.
 * Clamps days to the end of month (e.g., Jan 31 + 1 month = Feb 28/29).
 *
 * @param {string|Date} startDateStr - ISO or YYYY-MM-DD date string
 * @param {number|string} durationMonths - positive number of months
 * @returns {Date|null} Expiry Date object or null if invalid inputs
 */
export const calculateExpiryDate = (startDateStr, durationMonths = 1) => {
  if (!startDateStr) return null;
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return null;

  const months = parseInt(durationMonths, 10);
  if (isNaN(months) || months <= 0) return null;

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();

  const targetTotalMonths = startMonth + months;
  const targetYear = startYear + Math.floor(targetTotalMonths / 12);
  const normalizedMonth = ((targetTotalMonths % 12) + 12) % 12;

  // Last day in target month: new Date(year, month + 1, 0).getDate()
  const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const targetDay = Math.min(startDay, daysInTargetMonth);

  const expiry = new Date(start);
  expiry.setDate(1);
  expiry.setFullYear(targetYear);
  expiry.setMonth(normalizedMonth);
  expiry.setDate(targetDay);

  return expiry;
};

/**
 * Formats a Date object into human-readable string: e.g. "Oct 22, 2026"
 */
export const formatDisplayDate = (date) => {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
