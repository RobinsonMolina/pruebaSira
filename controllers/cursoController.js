const Curso = require('../models/Curso');
const Asignatura = require('../models/Asignatura');
const Docente = require('../models/Docente');
const PeriodoAcademico = require('../models/PeriodoAcademico');

exports.crearCurso = async (req, res) => {
  try {
    const { id, cuposDisponibles, asignatura, docente, periodo } = req.body;

    // Verifica si ya existe un curso con el mismo ID
    const cursoExistente = await Curso.findOne({ id });
    if (cursoExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un curso con ese ID' });
    }

    const nuevoCurso = new Curso({
      id,
      cuposDisponibles,
      asignatura,
      docente,
      periodo
    });

    // Usa save() en lugar de create() ya que ya tienes una instancia del modelo
    await nuevoCurso.save();
    res.status(201).json({ mensaje: 'Curso creado exitosamente', curso: nuevoCurso });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el curso', error: error.message });
  }
};

exports.obtenerCursos = async (req, res) => {
  try {
    const cursos = await Curso.find();

    // Obtener los detalles de las referencias manualmente
    const cursosConDetalles = await Promise.all(cursos.map(async (curso) => {
      const asignatura = await Asignatura.findOne({ id: curso.asignatura });
      const docente = await Docente.findOne({ id: curso.docente });
      const periodo = await PeriodoAcademico.findOne({ id: curso.periodo });

      return {
        ...curso.toObject(),
        asignatura: asignatura ? asignatura.nombre : 'Desconocido',
        docente: docente ? `${docente.nombre} ${docente.apellido}` : 'Desconocido',
        periodo: periodo ? periodo.nombrePeriodo : 'Desconocido'
      };
    }));

    res.status(200).json(cursosConDetalles);
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los cursos', error: error.message });
  }
};

exports.obtenerEstudiantesPorCurso = async (req, res) => {
  try {
    const cursoId = req.params.cursoId;

    const curso = await Curso.findOne({ id: cursoId });
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    const estudiantes = await Estudiante.find({ id: { $in: curso.estudiantes } });

    res.status(200).json(estudiantes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los estudiantes', error: error.message });
  }
};

