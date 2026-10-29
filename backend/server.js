require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const { logger, errorHandler } = require('./middleware');
const r = require('./routes/modules');

const app = express();
const origins = (process.env.CLIENT_URL || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());
app.use(logger);
app.get('/', (q, s) => s.json({ status: 'AgriTech API running' }));
app.use('/api/auth', require('./routes/auth'));
for (const k of Object.keys(r)) app.use('/api/' + k, r[k]);
app.use((q, s) => s.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5001, () => console.log('Server up')))
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
