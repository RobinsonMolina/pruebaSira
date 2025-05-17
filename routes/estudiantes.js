const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudianteController');

router.post('/', controller.crearEstudiante);
router.get('/porSemestre', controller.obtenerPorSemestre);
router.post('/inscribirAsignatura', controller.inscribirMateria);
router.get('/:estudianteId/asignaturas', controller.obtenerAsignaturasEstudiante);
router.post('/aprobarAsignatura', controller.agregarAsignaturaAprobada);

// Nuevas rutas para la actualización de estudiantes
router.get('/:id', controller.obtenerPorId);
router.put('/actualizar', controller.actualizarEstudiante);

module.exports = router;
