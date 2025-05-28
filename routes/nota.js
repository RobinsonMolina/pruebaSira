const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// POST /api/notas - Registrar una nueva nota
router.post('/', notaController.registrarNota);

// PUT /api/notas - Actualizar una nota existente
router.put('/', notaController.actualizarNota);

module.exports = router;