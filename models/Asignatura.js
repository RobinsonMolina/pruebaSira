const mongoose = require('mongoose');

const asignaturaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  numeroCredito: { type: Number, required: true },
  semestre: { type: Number, required: true },
  prerequisitos: [{ type: String }] // Array de prerequisitos
});

module.exports = mongoose.model('Asignatura', asignaturaSchema);
