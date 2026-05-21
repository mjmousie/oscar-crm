import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Parse a CSV or XLSX File object into an array of row objects.
 * Throws a user-friendly error for unsupported types.
 */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: (err) => reject(new Error(err.message)),
      })
      return
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
          resolve(data)
        } catch (err) {
          reject(new Error('Failed to parse Excel file: ' + err.message))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
      return
    }

    reject(new Error('Unsupported file type. Please upload a CSV, XLSX, or XLS file.'))
  })
}
