const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignaturaController');

router.post('/', controller.crearAsignatura);
router.get('/porSemestre', controller.obtenerPorSemestre);
router.get('/', controller.obtenerTodas);

module.exports = router;
