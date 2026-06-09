export const TYPE_UZ = {
  apartment: 'Kvartira',
  house:     'Uy / Hovli',
  office:    'Ofis',
  land:      'Yer',
}

export const PURPOSE_UZ = {
  sell: 'Sotiladi',
  rent: 'Ijaraga',
}

export const NEED_UZ = {
  buy:  'Sotib oladi',
  rent: 'Ijaraga oladi',
}

export const STATUS_UZ = {
  active:   'Faol',
  inactive: 'Noaktiv',
  archived: 'Arxiv',
  sold:     'Sotildi',
  reserved: 'Band',
}

export const ROLE_UZ = {
  admin:   'Admin',
  agent:   'Agent',
  company: 'Kompaniya',
}

export const ROOMS = ['1', '2', '3', '4', '5+']
export const REGIONS = ['Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon', "Farg'ona", 'Qo\'qon', 'Xukandiy', 'Qashqadaryo', 'Surxondaryo', 'Sirdaryo', 'Xorazm', 'Navoiy', 'Jizzax', "Qoraqalpog'iston"]

export const fmt = (n) =>
  n ? '$' + Number(n).toLocaleString('en-US') : '—'

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('uz-UZ') : '—'

export const fmtTime = (d) => {
  if (!d) return '—'
  const now = new Date()
  const dt  = new Date(d)
  const diff = now - dt
  if (diff < 60000)   return 'Hozir'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' daqiqa oldin'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' soat oldin'
  const days = Math.floor(diff / 86400000)
  if (days === 1) return 'Kecha'
  if (days < 7)  return days + ' kun oldin'
  return fmtDate(d)
}

export const matchScore = (client, property) => {
  let score = 0
  let total = 0
  const add = (pts, cond) => { total += pts; if (cond) score += pts }
  add(40, property.price >= (client.budget_min || 0) && property.price <= (client.budget_max || 1e9))
  add(25, !client.rooms || client.rooms === property.rooms)
  add(20, client.region && property.region?.toLowerCase().includes(client.region?.toLowerCase()))
  add(15, property.property_type === client.property_type)
  return total ? Math.round(score / total * 100) : 0
}
