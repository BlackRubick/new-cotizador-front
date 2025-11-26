// Centralized seller companies mapping and lookup helper
const companies = {
  'conduit-life': {
    template: 'CONDUIT-LIFE.jpeg',
    name: 'CONDUIT LIFE',
    fullName: 'Conduit Life S.A. de C.V.',
    address: 'Camino Real a Xochitepec 108 PA, Colonia La Noria Xochimilco, CDMX CP: 16030',
    rfc: 'CLI150120328'
  },
  'biosystems-hls': {
    template: 'Biosystems-HLS.jpeg',
    name: 'BIOSYSTEMS HLS',
    fullName: 'Biosystems HLS S.A. de C.V.',
    address: 'Camino Real a Xochitepec 108 PA, Colonia La Noria Xochimilco, CDMX CP: 16030',
    rfc: 'BHL130614LQ4'
  },
  'ingenieria-clinica': {
    template: 'INGENIERIA-CLINICA-DISEÑO.jpeg',
    name: 'INGENIERÍA CLÍNICA Y DISEÑO',
    fullName: 'Ingeniería Clínica y Diseño S.A. de C.V.',
    address: 'Viena 68, Colonia Del Carmen, Alcaldía Coyoacán, CP. 04100 CDMX',
    rfc: 'ICD090619J79'
  },
  'escala-biomedica': {
    template: 'ESCALA-BIOMEDICA.jpeg',
    name: 'ESCALA BIOMÉDICA',
    fullName: 'Escala Biomédica S.A. de C.V.',
    address: 'Av. Insurgentes 682 int. 706, Colonia Del Valle Norte, Benito Juárez CP. 03103 CDMX',
    rfc: 'EBI1081216T38'
  }
}

function findSellerCompany(rawKey) {
  if (!rawKey && rawKey !== 0) return null
  const key = String(rawKey).trim()
  if (!key) return null

  // Try slug match first
  const slug = key.toLowerCase()
  if (companies[slug]) return companies[slug]

  // Then try matching by display name / fullName (case-insensitive)
  const upper = key.toUpperCase()
  const byName = Object.values(companies).find(c => ((c.name || '').toUpperCase() === upper) || ((c.fullName || '').toUpperCase() === upper))
  if (byName) return byName

  return null
}

export { companies as sellerCompanies, findSellerCompany }
