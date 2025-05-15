const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  periodoIngreso: { type: String, required: true }, // Ej: "2024-1"
  fechaNacimiento: { type: Date, required: true },
  numeroDocumento: { type: String, required: true, unique: true },
  celular: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  direccion: { type: String, required: true },
  promedioAcumulado: { type: Number, required: true, min: 0, max: 5 },
  promedioPonderado: { type: Number, required: true, min: 0, max: 5 },
  semestreActual: { type: Number, required: true, min: 1, max: 10 },
  asignaturasAprobadas: [{ type: String }], // Asignaturas aprobadas
  asignaturasActuales: [{ type: String }]   // Asignaturas que está viendo actualmente
});

module.exports = mongoose.model('Estudiante', estudianteSchema);
