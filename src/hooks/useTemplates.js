import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'

export function useTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const all = await db.templates.orderBy('createdAt').reverse().toArray()
    setTemplates(all)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveTemplate = useCallback(async (tpl) => {
    await db.templates.put(tpl)
    await load()
  }, [load])

  const deleteTemplate = useCallback(async (id) => {
    await db.templates.delete(id)
    await load()
  }, [load])

  return { templates, loading, saveTemplate, deleteTemplate }
}
