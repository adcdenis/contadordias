const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

// Importar rotas
const authRoutes = require('../backend/routes/auth');
const counterRoutes = require('../backend/routes/counters');
const userRoutes = require('../backend/routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Erro ao conectar MongoDB:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/users', userRoutes);

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'API do Contador de Dias funcionando!' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

module.exports = app;