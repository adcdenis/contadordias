const express = require('express');
const router = express.Router();
const { getCounters, getCounterById, createCounter, updateCounter, deleteCounter } = require('../controllers/counterController');
const { protect } = require('../middleware/auth');

// Todas as rotas são protegidas
router.use(protect);

// Rotas de contadores
router.route('/')
  .get(getCounters)
  .post(createCounter);

router.route('/:id')
  .get(getCounterById)
  .put(updateCounter)
  .delete(deleteCounter);

module.exports = router;