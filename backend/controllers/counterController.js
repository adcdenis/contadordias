const Counter = require('../models/Counter');

// Helper para avançar contadores recorrentes até uma data futura
const advanceRecurringCounter = (counter) => {
  const type = counter.recurrence || 'none';
  if (type === 'none') return false;
  let next = new Date(counter.eventDate);
  const now = new Date();
  let changed = false;
  // Avançar enquanto a data do evento for passada ou igual ao agora
  while (next <= now) {
    if (type === 'weekly') {
      next.setDate(next.getDate() + 7);
    } else if (type === 'monthly') {
      // Avançar um mês, preservando horário
      const h = next.getHours();
      const m = next.getMinutes();
      const s = next.getSeconds();
      const ms = next.getMilliseconds();
      next.setMonth(next.getMonth() + 1);
      next.setHours(h, m, s, ms);
    } else if (type === 'yearly') {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      break;
    }
    changed = true;
  }
  if (changed) {
    counter.eventDate = next;
  }
  return changed;
};

// @desc    Obter todos os contadores do usuário
// @route   GET /api/counters
// @access  Private
exports.getCounters = async (req, res) => {
  try {
    const counters = await Counter.find({ user: req.user._id });
    // Avançar contadores recorrentes automaticamente para próxima ocorrência
    for (const counter of counters) {
      if (advanceRecurringCounter(counter)) {
        await counter.save();
      }
    }
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

    // Avançar contador recorrente automaticamente
    if (advanceRecurringCounter(counter)) {
      await counter.save();
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
    const { name, description, eventDate, category, tags, isFavorite, recurrence } = req.body;

    const counter = new Counter({
      name,
      description,
      eventDate,
      category,
      tags,
      isFavorite,
      recurrence: recurrence || 'none',
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
    const { name, description, eventDate, category, tags, isFavorite, recurrence } = req.body;

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
    if (typeof recurrence === 'string') {
      counter.recurrence = recurrence;
    }

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