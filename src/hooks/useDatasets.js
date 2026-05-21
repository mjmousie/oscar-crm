import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useDatasets() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const all = await db.datasets.orderBy('createdAt').reverse().toArray()
    setDatasets(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveDataset = useCallback(async (dataset) => {
    await db.datasets.put(dataset)
    await load()
  }, [load])

  const deleteDataset = useCallback(async (id) => {
    await db.datasets.delete(id)
    await load()
  }, [load])

  const updateRow = useCallback(async (datasetId, rowIdx, updates) => {
    const dataset = await db.datasets.get(datasetId)
    if (!dataset) return
    const rows = [...dataset.rows]
    rows[rowIdx] = { ...rows[rowIdx], ...updates }
    await db.datasets.put({ ...dataset, rows })
    await load()
  }, [load])

  const deleteRow = useCallback(async (datasetId, rowIdx) => {
    const dataset = await db.datasets.get(datasetId)
    if (!dataset) return
    const rows = dataset.rows.filter((_, i) => i !== rowIdx)
    await db.datasets.put({ ...dataset, rows, rowCount: rows.length })
    await load()
  }, [load])

  return { datasets, loading, saveDataset, deleteDataset, updateRow, deleteRow }
}
