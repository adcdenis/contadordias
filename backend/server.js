require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Importar rotas
const authRoutes = require('./routes/auth');
const counterRoutes = require('./routes/counters');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Conectar ao MongoDB (não logar URI sensível)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/contadordias', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB conectado com sucesso!');
  // Listar as collections disponíveis
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('Collections disponíveis:', collections.map(c => c.name));
    });
})
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/users', userRoutes);

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});