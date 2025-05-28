const Inscripcion = require('../models/Inscripcion');
const Estudiante = require('../models/Estudiante');
const Asignatura = require('../models/Asignatura');
const PeriodoAcademico = require('../models/PeriodoAcademico');
const Curso = require('../models/Curso'); // Asegúrate de tener este modelo

const { v4: uuidv4 } = require('uuid');

exports.inscribirEstudiante = async (req, res) => {
  try {
    const { estudianteId, asignaturaId, periodoId, curso, docenteId } = req.body;

    console.log('Datos recibidos:', req.body); // Debug

    // Validar campos requeridos
    if (!estudianteId || !asignaturaId || !periodoId || !curso) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: estudianteId, asignaturaId, periodoId, curso'
      });
    }

    // Verificar que el estudiante existe
    const estudiante = await Estudiante.findOne({ id: estudianteId });
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Verificar que la asignatura existe
    const asignatura = await Asignatura.findOne({ id: asignaturaId });
    if (!asignatura) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }

    // Verificar que el período existe y está activo
    const periodo = await PeriodoAcademico.findOne({ id: periodoId });
    if (!periodo) {
      return res.status(404).json({ error: 'Período académico no encontrado' });
    }
    if (!periodo.activo) {
      return res.status(400).json({ error: 'El período académico no está activo' });
    }

    // Verificar que el curso existe
    const cursoExiste = await Curso.findOne({ id: curso });
    if (!cursoExiste) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Verificar si ya está inscrito en esta asignatura en este período y curso
    const inscripcionExistente = await Inscripcion.findOne({
      estudiante: estudianteId,
      asignatura: asignaturaId,
      periodoAcademico: periodoId,
      curso: curso
    });

    if (inscripcionExistente) {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta asignatura para este período y curso' });
    }

    // Verificar si ya aprobó la asignatura
    if (estudiante.asignaturasAprobadas.includes(asignaturaId)) {
      return res.status(400).json({ error: 'El estudiante ya aprobó esta asignatura' });
    }

    // Verificar prerrequisitos
    if (asignatura.prerequisitos && asignatura.prerequisitos.length > 0) {
      const prerequisitosNoCumplidos = asignatura.prerequisitos.filter(
        prereq => !estudiante.asignaturasAprobadas.includes(prereq)
      );

      if (prerequisitosNoCumplidos.length > 0) {
        return res.status(400).json({
          error: 'El estudiante no cumple con los prerrequisitos',
          prerequisitosFaltantes: prerequisitosNoCumplidos
        });
      }
    }

    // Validar promedio (si es menor a 2.0, máximo 3 materias)
    if (estudiante.promedioAcumulado <= 2.0) {
      const inscripcionesActuales = await Inscripcion.countDocuments({
        estudiante: estudianteId,
        periodoAcademico: periodoId,
        estado: 'inscrito'
      });

      if (inscripcionesActuales >= 3) {
        return res.status(400).json({
          error: 'Estudiante con promedio bajo (≤2.0) no puede inscribir más de 3 materias'
        });
      }
    }

    // Validar límite de créditos (máximo 15)
    const inscripcionesDelPeriodo = await Inscripcion.find({
      estudiante: estudianteId,
      periodoAcademico: periodoId,
      estado: 'inscrito'
    });

    let creditosActuales = 0;
    for (const insc of inscripcionesDelPeriodo) {
      const asig = await Asignatura.findOne({ id: insc.asignatura });
      if (asig) creditosActuales += asig.numeroCredito;
    }

    if (creditosActuales + asignatura.numeroCredito > 15) {
      return res.status(400).json({
        error: `Excede el límite de 15 créditos. Créditos actuales: ${creditosActuales}, Créditos de la materia: ${asignatura.numeroCredito}`
      });
    }

    // Crear la inscripción con UUID
    const nuevaInscripcion = await Inscripcion.create({
      id: uuidv4(), // Usar UUID en lugar de un contador
      estudiante: estudianteId,
      asignatura: asignaturaId,
      periodoAcademico: periodoId,
      curso: curso,
      docente: docenteId || null,
      estado: 'inscrito'
    });

    // Actualizar asignaturas actuales del estudiante
    if (!estudiante.asignaturasActuales.includes(asignaturaId)) {
      estudiante.asignaturasActuales.push(asignaturaId);
      await estudiante.save();
    }

    res.json({
      mensaje: 'Inscripción realizada correctamente',
      inscripcion: nuevaInscripcion
    });

  } catch (err) {
    console.error('Error al inscribir estudiante:', err);
    res.status(500).json({ error: 'Error al realizar inscripción', detalle: err.message });
  }
};


exports.obtenerInscripciones = async (req, res) => {
  try {
    const inscripciones = await Inscripcion.find();
    res.json(inscripciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener inscripciones', detalle: err.message });
  }
};

exports.obtenerInscripcionesPorEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    
    const inscripciones = await Inscripcion.find({ estudiante: estudianteId })
      .populate('asignatura', 'nombre numeroCredito semestre')
      .populate('periodoAcademico', 'nombrePeriodo')
      .populate('curso', 'nombre numeroCurso') // AGREGAR populate para curso
      .populate('docente', 'nombre apellido');
    
    res.json(inscripciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener inscripciones del estudiante', detalle: err.message });
  }
};

exports.obtenerInscripcionesPorPeriodo = async (req, res) => {
  try {
    const { periodoId } = req.params;
    
    const inscripciones = await Inscripcion.find({ periodoAcademico: periodoId })
      .populate('estudiante', 'nombre apellido numeroDocumento semestreActual')
      .populate('asignatura', 'nombre numeroCredito semestre')
      .populate('curso', 'nombre numeroCurso') // AGREGAR populate para curso
      .populate('docente', 'nombre apellido');
    
    res.json(inscripciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener inscripciones del período', detalle: err.message });
  }
};

exports.cambiarEstadoInscripcion = async (req, res) => {
  try {
    const { inscripcionId, nuevoEstado } = req.body;
    
    const estadosValidos = ['inscrito', 'aprobado', 'reprobado', 'cancelado'];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    
    const inscripcion = await Inscripcion.findOneAndUpdate(
      { id: inscripcionId },
      { estado: nuevoEstado },
      { new: true }
    );
    
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }
    
    res.json({ 
      mensaje: 'Estado de inscripción actualizado',
      inscripcion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cambiar estado de inscripción', detalle: err.message });
  }
};