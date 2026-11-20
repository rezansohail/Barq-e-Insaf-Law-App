const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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
app.use('/api/translate', require('./routes/translate'));

// Swagger Interactive Testing Platform
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Barq-e-Insaf API Testing Platform',
  customCss: '.swagger-ui .topbar { background-color: #1a0802; border-bottom: 2px solid #FF9500; } .swagger-ui .topbar-wrapper img { content: url("https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png"); }',
}));
app.use('/docs', (req, res) => res.redirect('/api-docs'));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    message: 'Barq-e-Insaf API running with Neon PostgreSQL',
    docs: 'http://localhost:5000/api-docs'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Barq-e-Insaf API server online on port ${PORT} [db ready]`));
