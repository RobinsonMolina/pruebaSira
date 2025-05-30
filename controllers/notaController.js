const Nota = require('../models/Nota');
const Inscripcion = require('../models/Inscripcion');
const Estudiante = require('../models/Estudiante');
const getNextSecuencia = require('../models/secuencias');

exports.registrarNota = async (req, res) => {
  try {
    const { inscripcionId, notaFinal, observaciones } = req.body;
    
    // Validar que la nota esté en el rango correcto
    if (notaFinal < 0.0 || notaFinal > 5.0) {
      return res.status(400).json({ error: 'La nota debe estar entre 0.0 y 5.0' });
    }
    
    // Verificar que la inscripción existe
    const inscripcion = await Inscripcion.findOne({ id: inscripcionId });
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }
    
    // Verificar si ya existe una nota para esta inscripción
    const notaExistente = await Nota.findOne({ idInscripcion: inscripcionId });
    if (notaExistente) {
      return res.status(400).json({ error: 'Ya existe una nota registrada para esta inscripción' });
    }
    

    const nextSecuencia = await getNextSecuencia('nota', 100000);
    const idFormateado = nextSecuencia.toString().padStart(6, '0');

    // Crear la nota
    const nuevaNota = await Nota.create({
      id: idFormateado,
      notaFinal,
      idInscripcion: inscripcionId,
      observaciones
    });
    
    // Actualizar el estado de la inscripción
    const nuevoEstado = nuevaNota.aprobada ? 'Aprobado' : 'Reprobado';
    await Inscripcion.findOneAndUpdate(
      { id: inscripcionId },
      { estado: nuevoEstado }
    );
    
    // Si aprobó, mover la asignatura de actuales a aprobadas
    if (nuevaNota.aprobada) {
      const estudiante = await Estudiante.findOne({ id: inscripcion.estudiante });
      if (estudiante) {
        // Remover de asignaturas actuales
        estudiante.asignaturasActuales = estudiante.asignaturasActuales.filter(
          asig => asig !== inscripcion.asignatura
        );
        
        // Agregar a asignaturas aprobadas si no está ya
        if (!estudiante.asignaturasAprobadas.includes(inscripcion.asignatura)) {
          estudiante.asignaturasAprobadas.push(inscripcion.asignatura);
        }
        
        await estudiante.save();
      }
    }
    
    res.json({ 
      mensaje: 'Nota registrada correctamente',
      nota: nuevaNota,
      aprobada: nuevaNota.aprobada
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar nota', detalle: err.message });
  }
};

exports.actualizarNota = async (req, res) => {
  try {
    const { notaId, notaFinal, observaciones } = req.body;
    
    // Validar que la nota esté en el rango correcto
    if (notaFinal < 0.0 || notaFinal > 5.0) {
      return res.status(400).json({ error: 'La nota debe estar entre 0.0 y 5.0' });
    }
    
    const nota = await Nota.findOne({ id: notaId });
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    
    // Obtener la inscripción relacionada
    const inscripcion = await Inscripcion.findOne({ id: nota.idInscripcion });
    
    // Actualizar la nota
    const estadoAnterior = nota.aprobada;
    nota.notaFinal = notaFinal;
    nota.observaciones = observaciones;
    await nota.save(); // El middleware se encarga de actualizar 'aprobada'
    
    // Actualizar estado de inscripción
    const nuevoEstado = nota.aprobada ? 'Aprobado' : 'Reprobado';
    await Inscripcion.findOneAndUpdate(
      { id: nota.idInscripcion },
      { estado: nuevoEstado }
    );
    
    // Si cambió el estado de aprobación, actualizar arrays del estudiante
    if (estadoAnterior !== nota.aprobada && inscripcion) {
      const estudiante = await Estudiante.findOne({ id: inscripcion.estudiante });
      if (estudiante) {
        if (nota.aprobada) {
          // Pasó de reprobado a aprobado
          estudiante.asignaturasActuales = estudiante.asignaturasActuales.filter(
            asig => asig !== inscripcion.asignatura
          );
          if (!estudiante.asignaturasAprobadas.includes(inscripcion.asignatura)) {
            estudiante.asignaturasAprobadas.push(inscripcion.asignatura);
          }
        } else {
          // Pasó de aprobado a reprobado
          estudiante.asignaturasAprobadas = estudiante.asignaturasAprobadas.filter(
            asig => asig !== inscripcion.asignatura
          );
          if (!estudiante.asignaturasActuales.includes(inscripcion.asignatura)) {
            estudiante.asignaturasActuales.push(inscripcion.asignatura);
          }
        }
        await estudiante.save();
      }
    }
    
    res.json({ 
      mensaje: 'Nota actualizada correctamente',
      nota,
      cambioEstado: estadoAnterior !== nota.aprobada
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar nota', detalle: err.message });
  }
};