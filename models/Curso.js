const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  cuposDisponibles: { type: Number, required: true, min: 0 },
  inscritos: { type: Number, default: 0, min: 0 },
  asignatura: { type: String, required: true, ref: 'Asignatura' },
  docente: { type: String, required: true, ref: 'Docente' },
  periodo: { type: String, required: true, ref: 'PeriodoAcademico' },
  estudiantes: [{ type: String, ref: 'Estudiante' }],
  activo: { type: Boolean, default: true }
});

// Validación para que inscritos no supere cupos disponibles
cursoSchema.pre('save', function(next) {
  if (this.inscritos > this.cuposDisponibles) {
    const error = new Error('El número de inscritos no puede superar los cupos disponibles');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Curso', cursoSchema);