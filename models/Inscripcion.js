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

module.exports = mongoose.model('Inscripcion', inscripcionSchema);