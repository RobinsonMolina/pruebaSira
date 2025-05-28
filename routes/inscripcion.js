const express = require('express');
const router = express.Router();
const inscripcionController = require('../controllers/inscripcionController');

// POST /api/inscripciones - Inscribir un estudiante en una asignatura
router.post('/', inscripcionController.inscribirEstudiante);

// GET /api/inscripciones - Obtener todas las inscripciones
router.get('/', inscripcionController.obtenerInscripciones);

// GET /api/inscripciones/estudiante/:estudianteId - Obtener inscripciones de un estudiante específico
router.get('/estudiante/:estudianteId', inscripcionController.obtenerInscripcionesPorEstudiante);

// GET /api/inscripciones/periodo/:periodoId - Obtener inscripciones de un período específico
router.get('/periodo/:periodoId', inscripcionController.obtenerInscripcionesPorPeriodo);

// PUT /api/inscripciones/estado - Cambiar estado de una inscripción
router.put('/estado', inscripcionController.cambiarEstadoInscripcion);

module.exports = router;