const mongoose = require('mongoose');

const prerequisitoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true }
});

const Prerequisito = mongoose.model('Prerequisito', prerequisitoSchema);