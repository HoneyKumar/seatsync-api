const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const { message } = err;
  if (status === 500) {
    console.log('Error Details ', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  } else {
    return res.status(status).json({ message });
  }
};

module.exports = errorHandler;
