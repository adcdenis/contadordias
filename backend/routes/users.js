const express = require('express');
const router = express.Router();
const { getUsers, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// Todas as rotas são protegidas e restritas a administradores
router.use(protect);
router.use(admin);

// Rotas de usuários
router.route('/')
  .get(getUsers);

router.route('/:id')
  .delete(deleteUser);

module.exports = router;