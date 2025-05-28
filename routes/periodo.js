const express = require('express');
const router = express.Router();
const periodoController = require('../controllers/periodoController');

// POST /api/periodos - Crear un nuevo período académico
router.post('/', periodoController.crearPeriodo);

// GET /api/periodos - Obtener todos los períodos académicos
router.get('/', periodoController.obtenerTodos);

// GET /api/periodos/activo - Obtener el período académico activo
router.get('/activo', periodoController.obtenerActivo);

// PUT /api/periodos/activar/:id - Activar un período académico específico
router.put('/activar/:id', periodoController.activarPeriodo);

// PUT /api/periodos - Actualizar un período académico
router.put('/', periodoController.actualizarPeriodo);

module.exports = router;