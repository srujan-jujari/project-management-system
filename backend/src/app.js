require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();

const defaultCorsOrigins =
  process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:5173,http://127.0.0.1:5173';
const allowedOrigins = (process.env.CORS_ORIGINS || defaultCorsOrigins)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origin is not allowed by CORS');
      error.status = 403;
      return callback(error);
    },
    credentials: false,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);
app.use('/api/projects', projectRoutes);

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
