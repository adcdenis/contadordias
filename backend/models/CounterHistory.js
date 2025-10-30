const mongoose = require('mongoose');

const CounterHistorySchema = new mongoose.Schema({
  counter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counter',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Snapshot dos dados no momento da alteração
  snapshot: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    eventDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      default: 'Geral'
    },
    recurrence: {
      type: String,
      enum: ['none', 'weekly', 'monthly', 'yearly'],
      default: 'none'
    }
  },
  // Snapshot de tempo calculado no momento da alteração
  timeSnapshot: {
    years: { type: Number, default: 0 },
    months: { type: Number, default: 0 },
    days: { type: Number, default: 0 },
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 },
    past: { type: Boolean, default: false },
    formattedDistance: { type: String, default: '' }
  },
  // Tipo de operação
  operation: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  // Data e hora da alteração
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para otimizar consultas por contador
CounterHistorySchema.index({ counter: 1, createdAt: -1 });

// Índice para otimizar consultas por usuário
CounterHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CounterHistory', CounterHistorySchema);