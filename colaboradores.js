/**
 * LISTA DE COLABORADORES (SALÓN DE LA FAMA)
 * Formato: "Nombre o Instagram | Descripción | Iniciales"
 */
const COLABS_RAW = [
  "@3dbat.impresiones | Fundador | 3B",
  "Comunidad MAKERS 3DBAT | Base de datos inicial | M3",
  // Agregá nuevos cracks acá abajo:
  "@Nag3D (Nico y May)| Miembro | N3D",
  "@morera3d (Lucho)| Admin | M3D",
];

const COLABS = COLABS_RAW.map(line => {
  const [name, desc, initials] = line.split('|').map(s => s.trim());
  return { name, desc, initials };
});