require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'API is running',
  });
});

app.use('/api/auth', authRoutes);

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((error, _request, response, _next) => {
  const status = Number.isInteger(error.status) ? error.status : 500;

  if (status >= 500) {
    console.error('API request failed:', error.name || 'Error');
  }

  const body = {
    success: false,
    message: status < 500 ? error.message : 'Internal server error',
  };

  if (status === 400 && error.details) {
    body.errors = error.details;
  }

  response.status(status).json(body);
});

module.exports = app;
