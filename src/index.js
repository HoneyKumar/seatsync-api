require('dotenv').config();
const express = require('express');

const eventRoutes = require('./routes/events.routes');
const healthRoutes = require('./routes/health.routes');
const app = express();

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

app.use(logger);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'SeatSync API is running' });
});

app.use('/events', eventRoutes);

app.use('/health', healthRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
