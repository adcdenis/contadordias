const Counter = require('../models/Counter');

// @desc    Obter todos os contadores do usuário
// @route   GET /api/counters
// @access  Private
exports.getCounters = async (req, res) => {
  try {
    const counters = await Counter.find({ user: req.user._id });
    res.json(counters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Obter um contador específico
// @route   GET /api/counters/:id
// @access  Private
exports.getCounterById = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);

    if (!counter) {
      return res.status(404).json({ message: 'Contador não encontrado' });
    }

    // Verificar se o contador pertence ao usuário
    if (counter.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    res.json(counter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Criar um novo contador
// @route   POST /api/counters
// @access  Private
exports.createCounter = async (req, res) => {
  try {
    const { name, description, eventDate, category, tags, isFavorite } = req.body;

    const counter = new Counter({
      name,
      description,
      eventDate,
      category,
      tags,
      isFavorite,
      user: req.user._id
    });

    const createdCounter = await counter.save();
    res.status(201).json(createdCounter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Atualizar um contador
// @route   PUT /api/counters/:id
// @access  Private
exports.updateCounter = async (req, res) => {
  try {
    const { name, description, eventDate, category, tags, isFavorite } = req.body;

    const counter = await Counter.findById(req.params.id);

    if (!counter) {
      return res.status(404).json({ message: 'Contador não encontrado' });
    }

    // Verificar se o contador pertence ao usuário
    if (counter.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    counter.name = name || counter.name;
    counter.description = description !== undefined ? description : counter.description;
    counter.eventDate = eventDate || counter.eventDate;
    counter.category = category || counter.category;
    counter.tags = tags || counter.tags;
    counter.isFavorite = isFavorite !== undefined ? isFavorite : counter.isFavorite;

    const updatedCounter = await counter.save();
    res.json(updatedCounter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Excluir um contador
// @route   DELETE /api/counters/:id
// @access  Private
exports.deleteCounter = async (req, res) => {
  try {
    const counter = await Counter.findById(req.params.id);

    if (!counter) {
      return res.status(404).json({ message: 'Contador não encontrado' });
    }

    // Verificar se o contador pertence ao usuário
    if (counter.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await counter.deleteOne();
    res.json({ message: 'Contador removido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};