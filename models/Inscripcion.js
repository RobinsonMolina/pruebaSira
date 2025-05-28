const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  estado: { 
    type: String, 
    required: true,
    enum: ['inscrito', 'aprobado', 'reprobado', 'cancelado'],
    default: 'inscrito'
  },
  estudiante: { type: String, required: true, ref: 'Estudiante' },
  asignatura: { type: String, required: true, ref: 'Asignatura' },
  curso: { type: String, required: true, ref: 'Curso' },
  periodoAcademico: { type: String, required: true, ref: 'PeriodoAcademico' },
  fechaInscripcion: { type: Date, default: Date.now }
});

// Índice compuesto para evitar inscripciones duplicadas
inscripcionSchema.index({ estudiante: 1, asignatura: 1, periodoAcademico: 1 }, { unique: true });

module.exports = mongoose.model('Inscripcion', inscripcionSchema);