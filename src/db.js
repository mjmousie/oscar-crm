import Dexie from 'dexie'

export const db = new Dexie('PrettyDataDB')

db.version(1).stores({
  datasets: 'id, name, createdAt',
})

// v2 adds the templates store
db.version(2).stores({
  datasets:  'id, name, createdAt',
  templates: 'id, name, type, createdAt',
})
