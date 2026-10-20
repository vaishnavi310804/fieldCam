/**
 * Shared currency formatter for FieldCam mobile application.
 * Formats monetary amounts into standardized USD currency strings with two decimal places.
 *
 * Examples:
 * - formatCurrency(15.13) => "$15.13"
 * - formatCurrency(0)     => "$0.00"
 * - formatCurrency(15)    => "$15.00"
 * - formatCurrency(null)  => "$0.00"
 */
export const formatCurrency = (val?: number | string | null): string => {
  const num = typeof val === "string" ? parseFloat(val) : Number(val);
  const safeNum = isNaN(num) ? 0 : num;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNum);
};

export default formatCurrency;
