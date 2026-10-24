const isPositiveWholeNumber = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

module.exports = { isPositiveWholeNumber };
