const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const percentFormatter = (digits: number) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

export const formatNumber = (value: number, digits = 1): string =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value >= 100 ? 0 : digits,
  }).format(value);

export const formatInteger = (value: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export const formatPercent = (value: number, digits = 1): string =>
  percentFormatter(digits).format(value);

export const formatPerGame = (value: number): string =>
  numberFormatter.format(value);

export const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));

export const formatSpan = (years: string): string => years.replace("-", " - ");

export const formatList = (items: readonly string[]): string =>
  new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(
    items,
  );

export const formatSigned = (value: number, digits = 1): string => {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "±";
  return `${prefix}${formatNumber(Math.abs(value), digits)}`;
};
