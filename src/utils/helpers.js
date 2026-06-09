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

export const ROOMS = ['1', '2', '3', '4', '5+']

// Viloyat o'rniga shaharlar/tumanlar ro'yxati
export const CITIES = [
  'Toshkent sh.',
  'Samarqand sh.',
  'Buxoro sh.',
  'Namangan sh.',
  'Andijon sh.',
  "Farg'ona sh.",
  "Qo'qon sh.",
  'Xukandiy',
  'Qarshi sh.',
  'Termiz sh.',
  'Nukus sh.',
  'Navoiy sh.',
  'Jizzax sh.',
  'Guliston sh.',
  'Urganch sh.',
  'Beruniy',
  'Chirchiq',
  'Olmaliq',
  'Angren',
  'Bekobod',
]

export const fmt = (n) =>
  n ? '$' + Number(n).toLocaleString('en-US') : '—'

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('uz-UZ') : '—'

export const fmtTime = (d) => {
  if (!d) return '—'
  const now  = new Date()
  const dt   = new Date(d)
  const diff = now - dt
  if (diff < 60000)    return 'Hozir'
  if (diff < 3600000)  return Math.floor(diff / 60000) + ' daqiqa oldin'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' soat oldin'
  const days = Math.floor(diff / 86400000)
  if (days === 1) return 'Kecha'
  if (days < 7)   return days + ' kun oldin'
  return fmtDate(d)
}
