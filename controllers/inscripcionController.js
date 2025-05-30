const Inscripcion = require('../models/Inscripcion');
const Estudiante = require('../models/Estudiante');
const Asignatura = require('../models/Asignatura');
const PeriodoAcademico = require('../models/PeriodoAcademico');
const Curso = require('../models/Curso');
const getNextSecuencia = require('../models/secuencias');

exports.inscribirEstudiante = async (req, res) => {
  try {
    const { estudianteId, asignaturaId, periodoId, curso, docenteId } = req.body;

    if (!estudianteId || !asignaturaId || !periodoId || !curso) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: estudianteId, asignaturaId, periodoId, curso'
      });
    }

    const estudiante = await Estudiante.findOne({ id: estudianteId });
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const asignatura = await Asignatura.findOne({ id: asignaturaId });
    if (!asignatura) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }

    const periodo = await PeriodoAcademico.findOne({ id: periodoId });
    if (!periodo) {
      return res.status(404).json({ error: 'Período académico no encontrado' });
    }
    if (!periodo.activo) {
      return res.status(400).json({ error: 'El período académico no está activo' });
    }

    const cursoExiste = await Curso.findOne({ id: curso });
    if (!cursoExiste) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const inscripcionExistente = await Inscripcion.findOne({
      estudiante: estudianteId,
      asignatura: asignaturaId,
      periodoAcademico: periodoId,
      curso: curso
    });

    if (inscripcionExistente) {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta asignatura para este período y curso' });
    }

    if (estudiante.asignaturasAprobadas.includes(asignaturaId)) {
      return res.status(400).json({ error: 'El estudiante ya aprobó esta asignatura' });
    }

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

    const nextSecuencia = await getNextSecuencia('inscripcion', 200000);
    const idFormateado = nextSecuencia.toString().padStart(6, '0');

    const nuevaInscripcion = await Inscripcion.create({
      id: idFormateado,
      estudiante: estudianteId,
      asignatura: asignaturaId,
      periodoAcademico: periodoId,
      curso: curso,
      docente: docenteId || null,
      estado: 'inscrito'
    });

    // Agregar el estudiante al curso
    if (!cursoExiste.estudiantes.includes(estudianteId)) {
      cursoExiste.estudiantes.push(estudianteId);
      await cursoExiste.save();
    }

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
      .populate('curso', 'nombre numeroCurso')
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
      .populate('curso', 'nombre numeroCurso')
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