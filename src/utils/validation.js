const isPositiveWholeNumber = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

const isValidEmail = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
};

module.exports = { isPositiveWholeNumber, isValidEmail };
