const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/citizens', require('./routes/citizens'));
app.use('/api/lawyers',  require('./routes/lawyers'));
app.use('/api/cases',    require('./routes/cases'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/ngo',      require('./routes/ngo'));
app.use('/api/ngos',     require('./routes/ngo'));
app.use('/api/media',    require('./routes/media'));

app.get('/', (req, res) => {
  res.json({ message: 'Barq-e-Insaf API running with Neon PostgreSQL' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
