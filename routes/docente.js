const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');

// GET /api/docentes - Obtener todos los docentes
router.get('/', docenteController.obtenerTodos);

// GET /api/docentes/:id - Obtener un docente por ID
router.get('/:id', docenteController.obtenerPorId);

// POST /api/docentes - Crear un nuevo docente
router.post('/', docenteController.crearDocente);

// PUT /api/docentes - Actualizar un docente
router.put('/', docenteController.actualizarDocente);

// DELETE /api/docentes/:id - Eliminar un docente
router.delete('/:id', docenteController.eliminarDocente);

module.exports = router;