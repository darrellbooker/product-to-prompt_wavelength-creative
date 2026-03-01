export function escapeCSVValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const csvHeaders = headers.map(escapeCSVValue).join(',')
  const csvRows = rows.map(row => row.map(escapeCSVValue).join(','))
  const csvContent = [csvHeaders, ...csvRows].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
