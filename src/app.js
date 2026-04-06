/**
 * Main Express application configuration.
 * Used by server.js and integration tests.
 */

const express = require('express');
const ENV = require('./config/env');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const recordRoutes = require('./routes/record.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

// Basic in-memory rate limiting to protect auth & data endpoints.
// NOTE: This is intended for the assignment (not production-grade distributed limiting).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});

const recordsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});

const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running successfully'
  });
});

// Swagger (OpenAPI) docs
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(swaggerSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use('/auth', authLimiter, authRoutes);
if (ENV.ENABLE_TEST_ROUTES) {
  app.use('/test', testRoutes);
}
app.use('/users', userRoutes);
app.use('/records', recordsLimiter, recordRoutes);
app.use('/dashboard', dashboardLimiter, dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.use(errorHandler);

module.exports = app;
