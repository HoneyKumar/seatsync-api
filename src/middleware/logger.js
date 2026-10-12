const formatTime = (duration) => {
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(2)}s`;
};
const logger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = formatTime(Date.now() - startTime);
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}`);
  });
  next();
};

module.exports = logger;
