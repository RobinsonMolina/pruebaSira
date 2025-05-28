const mongoose = require('mongoose');

// 1. MODELO PERIODO ACADÉMICO
const periodoAcademicoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombrePeriodo: { type: String, required: true }, // Ejemplo: "2025-1", "2025-2"
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('PeriodoAcademico', periodoAcademicoSchema);