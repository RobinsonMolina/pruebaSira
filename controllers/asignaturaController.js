const Asignatura = require('../models/Asignatura');

exports.crearAsignatura = async (req, res) => {
  try {
    const { id, nombre, numeroCredito, semestre, prerequisitos } = req.body;
    await Asignatura.create({ id, nombre, numeroCredito, semestre, prerequisitos });
    res.json({ mensaje: 'Asignatura creada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la asignatura', detalle: err.message });
  }
};

exports.obtenerPorSemestre = async (req, res) => {
  const asignaturas = await Asignatura.find();
  const agrupadas = {};
  asignaturas.forEach(a => {
    const semestreStr = `Semestre ${a.semestre}`; // Concatena con "Semestre"
    if (!agrupadas[semestreStr]) agrupadas[semestreStr] = [];
    agrupadas[semestreStr].push(a);
  });
  res.json(agrupadas);
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

exports.agregarAsignaturaActual = async (req, res) => {
  try {
    // const { numeroDocumento, codigoAsignatura } = req.body;

    // const estudiante = await Estudiante.findOne({ numeroDocumento });
    // if (!estudiante) {
    //   return res.status(404).json({ error: 'Estudiante no encontrado' });
    // }

    // const asignatura = await Asignatura.findOne({ id: codigoAsignatura });
    // if (!asignatura) {
    //   return res.status(404).json({ error: 'Asignatura no encontrada' });
    // }

    // // Verificar si ya la aprobó
    // if (estudiante.asignaturasAprobadas.includes(codigoAsignatura)) {
    //   return res.status(400).json({ error: 'El estudiante ya aprobó esta asignatura' });
    // }

    // // Verificar si ya está inscrita actualmente
    // if (estudiante.asignaturasActuales.includes(codigoAsignatura)) {
    //   return res.status(400).json({ error: 'El estudiante ya está inscrito en esta asignatura' });
    // }

    // // Verificar prerequisitos
    // const prerequisitosNoCumplidos = asignatura.prerequisitos.filter(
    //   prereq => !estudiante.asignaturasAprobadas.includes(prereq)
    // );

    // if (prerequisitosNoCumplidos.length > 0) {
    //   return res.status(400).json({
    //     error: 'El estudiante no ha aprobado los prerequisitos requeridos',
    //     prerequisitosFaltantes: prerequisitosNoCumplidos
    //   });
    // }

    // Si todo está bien, agregar a las actuales
    estudiante.asignaturasActuales.push(codigoAsignatura);
    await estudiante.save();

    //res.json({ mensaje: 'Asignatura agregada a las actuales del estudiante' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar asignatura actual', detalle: err.message });
  }
};


exports.obtenerTodas = async (req, res) => {
  const asignaturas = await Asignatura.find();
  res.json(asignaturas);
};
