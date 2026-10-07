require('dotenv').config();

const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
      });
    },
  }),
);

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'API is running',
  });
});

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.status || 500).json({
    success: false,
    message: error.status ? error.message : 'Internal server error',
  });
});

module.exports = app;
