// ==========================================
// BASE DE DATOS DE CARRETES Y FILAMENTOS (TEXTO PLANO)
// ==========================================
// Instrucciones:
// 1. Cada línea es un carrete.
// 2. Usá la barra vertical (|) para separar los datos.
// 3. El formato es: Marca | Variante | Peso Vacio(g) | Rango(opcional) | Capacidad(g) | Material | ColorHex | ImagenURL
// 4. ImagenURL puede ser un link directo a la imagen del producto (JPG/PNG/WEBP) o dejarlo vacío.

const TEXTO_CARRETES = `
Marca     | Variante         | PesoVacio | Rango   | Capacidad | Material  | ColorHex | ImagenURL
----------|------------------|-----------|---------|-----------|-----------|----------|----------
3N3       | Estándar         | 182       |         | 1000      | Plástico  | #FF6B6B  | https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRixqDpCauIUbdHvMqjSp4mLyFaYRTSFsfBUu9zinW9K7nwJTckowPSge1f7DvoFCECzEg9MYbcdJpaPVInc_GVMgr08dilWool4Ob7Q8c5KUXKMo9IR8RD
Grilon3   | Nuevo 2025       | 220       |         | 1000      | Plástico  | #4ECDC4  | https://electrovanguardia.com.ar/wp-content/uploads/2025/11/pla_turquesa2-600x600-1.jpg
Grilon3   | Viejo            | 273       |         | 1000      | Plástico  | #4ECDC4  | https://http2.mlstatic.com/D_NQ_NP_663950-MLU72637599095_112023-O.webp
Creality  | Negra plastica   | 190       |         | 1000      | Plástico  | #4ECDC4  | https://http2.mlstatic.com/D_NQ_NP_966593-MLA71234191154_082023-O.webp  
Grilon3   | 2.5KG            | 550       |         | 2000      | Plástico  | #4ECDC4  | https://acdn-us.mitiendanube.com/stores/004/109/334/products/petg_maxicarrete_blanco1-9d972ecc229d095e9617059331855926-1024-1024.webp
GST       | Estándar         | 220       |         | 1000      | Plástico  | #45B7D1  | https://cdn.v2.tiendanegocio.com/gallery/42924/img_42924_dpku2covmdw0e1hr.jpeg?class=sm
GST       | Lite             | 116       |         | 1000      | Plástico  | #45B7D1  | https://http2.mlstatic.com/D_NQ_NP_661209-MLA111606871689_052026-O.webp
FilaAr    | Estándar         | 170       |         | 1000      | Plástico  | #96CEB4  | https://http2.mlstatic.com/D_NQ_NP_620879-MLA101287019468_122025-O.webp
Printalot | Estándar         | 150       | 129-150 | 1000      | Plástico  | #FFD93D  | https://tp3d.com.ar/4888-large_default/filamento-printalot-pla-silk-175mm-1kg.jpg
Printalot | Carton           | 145       |         | 1000      | Cartón    | #FFD93D  | https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEzYzdiZGUxZDI4ODE5MWIwN2RlMTUwMjMzYjE1NmM6ZmlsZV8wMDAwMDAwMGIzM2M3MjBlYjcyYjUzZDA0MjAxZmJmZSIsInRzIjoiMjA2MjkiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6IjMxMmIxZDFkYTQ4NzQzYjMwYzg1OGEwZDJkZjQ5OGNjMzQxNzk3ZWMzMGIyNDllN2IwZGYzODcxZmE2ZGE0YTgiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0=
Hellbot   | ECOFILA viejo    | 117       |         | 1000      | Plástico  | #C084FC  | https://http2.mlstatic.com/D_NQ_NP_631895-MLA95837305787_102025-O.webp
Hellbot   | ECOFILA (LOCK)   | 109       |         | 1000      | Plástico  | #C084FC  | https://http2.mlstatic.com/D_NQ_NP_958420-MLA95661490256_102025-O.webp
Hellbot   | ECOFILA (ROMBOS) | 270       |         | 1000      | Plástico  | #C084FC  | https://http2.mlstatic.com/D_Q_NP_693405-MLA95959662043_102025-O.webp
PlastAr   | Cartón           | 111       |         | 1000      | Cartón    | #6EE7B7  | https://images.precialo.com/products/filamento-impresora-3d-plastar-pla-175-1-kg-color-azul/5c2f5e6e-bd9e-4915-816c-41c1ad6b9061.jpeg
IIIDMAX   | Estándar         | 140       |         | 1000      | Plástico  | #FCD34D  | https://http2.mlstatic.com/D_NQ_NP_899103-MLA100010735003_122025-O.webp
ELEGOO    | Cartón           | 158       |         | 1000      | Cartón    | #60A5FA  | https://kimera3d.com.ar/wp-content/uploads/2025/11/FILAMENTO-ELEGOO-PLA-1.75mm-1KG-MARMOL.jpg
Freemover | Estándar NACIONAL| 140       |         | 1000      | Plástico  | #34D399  | https://http2.mlstatic.com/D_NQ_NP_677046-MLU77965440354_082024-O.webp
FILANOVA  | Plastico         | 155       |         | 1000      | Plástico  | #34D399  | https://proyectocolor.com.ar/wp-content/uploads/2026/02/3_4.png
SUNLU     | Plástico         | 165       |         | 1000      | Plástico  | #FB7185  | https://http2.mlstatic.com/D_NQ_NP_715174-MLA80079336934_102024-O.webp
ESUN      | Cartón           | 147       | 145-147 | 1000      | Cartón    | #A78BFA  | https://3dprintingservices.co.nz/wp-content/uploads/2020/12/Blue-PLA.webp
ESUN      | Plástico         | 265       |         | 1000      | Plástico  | #A78BFA  | https://m.media-amazon.com/images/I/615c+YdfIML._AC_UF1000,1000_QL80_.jpg
SOLEYIN   | Plástico         | 186       |         | 1000      | Plástico  | #A78BFA  | https://http2.mlstatic.com/D_NQ_NP_670378-CBT88999877678_082025-O.webp
`;

const TEXTO_MATERIALES = `
Material | Densidad
---------|---------
PLA      | 1.24
PETG     | 1.27
ABS      | 1.04
ASA      | 1.07
TPU      | 1.21
Nylon    | 1.14
PC       | 1.20
`;

// --- NO TOCAR EL CÓDIGO DE ABAJO ---
// Esto convierte el texto de arriba en el formato que la página necesita automáticamente.
const SPOOLS = TEXTO_CARRETES.trim().split('\n')
  .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('Marca') && !line.startsWith('-'))
  .map((line, index) => {
    const p = line.split('|').map(item => item.trim());
    const weightRaw = p[2];
    const weightNum = parseInt(weightRaw);

    return {
      id: index + 1,
      brand: p[0],
      variant: p[1],
      weight: isNaN(weightNum) ? null : weightNum,
      range: p[3] || null,
      nominal: parseInt(p[4]) || 1000,
      material: p[5],
      accent: p[6] || '#FFFFFF',
      imageUrl: p[7] || ''
    };
  });

const FILAMENT_MATERIALS = TEXTO_MATERIALES.trim().split('\n')
  .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('Material') && !line.startsWith('-'))
  .map(line => {
    const p = line.split('|').map(item => item.trim());
    return {
      name: p[0],
      density: parseFloat(p[1]) || 1.24
    };
  });
