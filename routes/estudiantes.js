const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudianteController');

router.post('/', controller.crearEstudiante);
router.get('/porSemestre', controller.obtenerPorSemestre);
router.post('/inscribirAsignatura', controller.inscribirMateria);
router.get('/:estudianteId/asignaturas', controller.obtenerAsignaturasEstudiante);
router.post('/aprobarAsignatura', controller.agregarAsignaturaAprobada);

module.exports = router;
