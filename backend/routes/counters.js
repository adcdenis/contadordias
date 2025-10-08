const express = require('express');
const router = express.Router();
const { getCounters, getCounterById, createCounter, updateCounter, deleteCounter, exportCounters, importCounters } = require('../controllers/counterController');
const { protect } = require('../middleware/auth');

// Todas as rotas são protegidas
router.use(protect);

// Rotas de contadores
router.route('/')
  .get(getCounters)
  .post(createCounter);

// Rotas específicas devem vir antes de rotas paramétricas
router.get('/export', exportCounters);
router.post('/import', importCounters);

router.route('/:id')
  .get(getCounterById)
  .put(updateCounter)
  .delete(deleteCounter);

module.exports = router;