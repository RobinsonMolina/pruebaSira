const express = require('express');
const router = express.Router();
const cursoController  = require('../controllers/cursoController');

router.post('/', cursoController.crearCurso);
router.get('/', cursoController.obtenerCursos);
router.get('cursos/:id', cursoController.obtenerEstudiantesPorCurso);

module.exports = router;
