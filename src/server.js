const app = require('./app');
const mapsRouter = require('./routes/maps');
app.use('/api', mapsRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Maps API: http://localhost:${PORT}/api/tables`);
});
