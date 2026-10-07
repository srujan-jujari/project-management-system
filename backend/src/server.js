const app = require('./app');

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

server.on('error', (error) => {
  console.error('Failed to start API server:', error);
  process.exitCode = 1;
});
