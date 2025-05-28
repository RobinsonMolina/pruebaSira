const Estudiante = require('../models/Estudiante');
const Asignatura = require('../models/Asignatura');

exports.crearEstudiante = async (req, res) => {
  try {
    const {
      id, nombre, apellido, periodoIngreso, fechaNacimiento, numeroDocumento, celular, direccion, promedioAcumulado, promedioPonderado, semestreActual, curso
    } = req.body;

    await Estudiante.create({
      id, nombre, apellido, periodoIngreso, fechaNacimiento, numeroDocumento, celular, direccion, promedioAcumulado, promedioPonderado, semestreActual, curso
    });

    res.json({ mensaje: 'Estudiante inscrito correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar estudiante', detalle: err.message });
  }
};

exports.obtenerEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find();
    res.json(estudiantes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los estudiantes', detalle: err.message });
  }
};


exports.obtenerPorSemestre = async (req, res) => {
  const estudiantes = await Estudiante.find();
  const agrupados = {};
  estudiantes.forEach(e => {
    const semestreStr = `Semestre ${e.semestreActual}`; // Concatena aquí
    if (!agrupados[semestreStr]) agrupados[semestreStr] = [];
    agrupados[semestreStr].push(e);
  });
  res.json(agrupados);
};

exports.inscribirMateria = async (req, res) => {
  try {
    const { estudianteId, asignaturaId } = req.body;
    
    const estudiante = await Estudiante.findOne({ id: estudianteId });
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    const asignatura = await Asignatura.findOne({ id: asignaturaId });
    if (!asignatura) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }

    if (estudiante.asignaturasAprobadas.includes(asignaturaId)) {
       return res.status(400).json({ error: 'El estudiante ya aprobó esta asignatura' });
    }

    if (estudiante.asignaturasActuales.includes(asignaturaId)) {
       return res.status(400).json({ error: 'El estudiante ya está inscrito en esta asignatura' });
    }
    
    //Verificar prerequisitos
    if (asignatura.prerequisitos && asignatura.prerequisitos.length > 0) {
      for (const prereq of asignatura.prerequisitos) {
        if (!estudiante.asignaturasAprobadas.includes(prereq)) {
          return res.status(400).json({ 
            error: `No puede inscribir esta asignatura. Falta aprobar el prerequisito: ${prereq}` 
          });
        }
      }
    }
    
    // Agrega la asignatura a las asignaturas actuales del estudiante
    if (!estudiante.asignaturasActuales.includes(asignaturaId)) {
      estudiante.asignaturasActuales.push(asignaturaId);
      await estudiante.save();
    }else{
      return res.status(400).json({ error: 'Estudiante ya está inscrito en esta materia' });
    }
    
    res.json({ mensaje: 'Materia inscrita correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al inscribir la materia', detalle: err.message });
  }
};

exports.obtenerAsignaturasEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    
    const estudiante = await Estudiante.findOne({ id: estudianteId });
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    // Obtener todas las asignaturas
    const todasAsignaturas = await Asignatura.find();
    
    // Agrupar asignaturas por semestre
    const asignaturasPorSemestre = {};
    todasAsignaturas.forEach(asignatura => {
      const semKey = `Semestre ${asignatura.semestre}`;
      if (!asignaturasPorSemestre[semKey]) {
        asignaturasPorSemestre[semKey] = [];
      }
      
      // Determinar el estado de la asignatura para este estudiante
      let estado = "Sin cursar";
      if (estudiante.asignaturasAprobadas.includes(asignatura.id)) {
        estado = "Aprobada";
      } else if (estudiante.asignaturasActuales.includes(asignatura.id)) {
        estado = "Cursando";
      }
      
      asignaturasPorSemestre[semKey].push({
        ...asignatura.toObject(),
        estado
      });
    });
    
    res.json({
      estudiante: {
        id: estudiante.id,
        nombre: `${estudiante.nombre} ${estudiante.apellido}`,
        semestre: estudiante.semestreActual
      },
      asignaturas: asignaturasPorSemestre
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asignaturas del estudiante', detalle: err.message });
  }
};

exports.agregarAsignaturaAprobada = async (req, res) => {
  try {
    const { numeroDocumento, codigoAsignatura } = req.body;

    const estudiante = await Estudiante.findOne({ numeroDocumento });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Si la asignatura está en las actuales, eliminarla de ahí
    estudiante.asignaturasActuales = estudiante.asignaturasActuales.filter(
      asig => asig !== codigoAsignatura
    );
    
    // Agrega el código de la asignatura al arreglo de asignaturas aprobadas (si no existe ya)
    if (!estudiante.asignaturasAprobadas.includes(codigoAsignatura)) {
      estudiante.asignaturasAprobadas.push(codigoAsignatura);
    }
    
    await estudiante.save();

    res.json({ mensaje: 'Asignatura marcada como aprobada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al aprobar la asignatura', detalle: err.message });
  }
};

// Controlador para actualizar estudiante
exports.actualizarEstudiante = async (req, res) => {
  try {
    const {
      id, nombre, apellido, periodoIngreso, fechaNacimiento, numeroDocumento, 
      celular, correo, direccion, promedioAcumulado, promedioPonderado, 
      semestreActual, curso
    } = req.body;

    const estudiante = await Estudiante.findOne({ id });
    
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    // Actualizar los campos
    estudiante.nombre = nombre;
    estudiante.apellido = apellido;
    estudiante.periodoIngreso = periodoIngreso;
    estudiante.fechaNacimiento = fechaNacimiento;
    estudiante.numeroDocumento = numeroDocumento;
    estudiante.celular = celular;
    estudiante.correo = correo;
    estudiante.direccion = direccion;
    estudiante.promedioAcumulado = promedioAcumulado;
    estudiante.promedioPonderado = promedioPonderado;
    estudiante.semestreActual = semestreActual;
    estudiante.curso = curso;
    
    await estudiante.save();
    
    res.json({ mensaje: 'Estudiante actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estudiante', detalle: err.message });
  }
};

// Método para obtener un estudiante por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await Estudiante.findOne({ id });
    
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    res.json(estudiante);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos del estudiante', detalle: err.message });
  }
};