'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useField, useForm } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { parseEbirdChecklistHtml } from '@/lib/ebird-parser'

// ── Industrial-Strength CSV Parser ───────────────────────────────────

function parseCsvToRows(csv: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]
    const nextChar = csv[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        i++ 
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField)
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++

      currentRow.push(currentField)
      rows.push(currentRow)
      currentRow = []
      currentField = ''
    } else {
      currentField += char
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  return rows.map(row => row.map(field => field.trim().replace(/^"|"$/g, '')))
}

function parseSpeciesName(s: string): { commonName: string; scientificName: string | null } {
  if (!s) return { commonName: '', scientificName: null }
  const m = s.match(/^(.+?)\s*\(([^)]+)\)$/)
  return m ? { commonName: m[1].trim(), scientificName: m[2].trim() } : { commonName: s.trim(), scientificName: null }
}

function parseCsvSpeciesList(csv: string) {
  console.log('--- Starting CSV Species Import ---')
  const rows = parseCsvToRows(csv.replace(/^\ufeff/, ''))

  if (rows.length < 2) {
    console.error('CSV contains insufficient data')
    return []
  }

  const header = rows[0].map(h => h.toLowerCase())
  const speciesIdx = header.findIndex(h => h === 'species')
  const countIdx = header.findIndex(h => h === 'count')

  if (speciesIdx === -1) {
    console.error('Could not find "Species" column')
    throw new Error('CSV must have a "Species" column')
  }

  const species: any[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const sf = row[speciesIdx]

    if (!sf) continue

    const { commonName, scientificName } = parseSpeciesName(sf)
    species.push({
      commonName,
      scientificName: scientificName ?? '',
      count: countIdx !== -1 ? (row[countIdx] || '') : '',
      comments: '',
    })
  }

  console.log(`Successfully extracted ${species.length} species.`)
  console.log('--- CSV Import Complete ---')
  return species
}

// ── Component ─────────────────────────────────────────────────────────

export const EbirdImportFieldClient: TextFieldClientComponent = (props) => {
  const { path } = props
  const { value, setValue } = useField<string>({ path: path! })
  const { dispatchFields } = useForm()

  const htmlInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState<'html' | 'csv' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<'html' | 'csv' | false>(false)

  const handleHtmlFile = useCallback(async (file: File) => {
    setLoading('html')
    setError(null)
    setSuccess(false)
    try {
      const text = await file.text()
      const data = parseEbirdChecklistHtml(text)
      const setter = (name: string, val: any) => dispatchFields({ type: 'UPDATE', path: name, value: val })

      setter('ebirdChecklistId', data.checklistId || '')
      setter('title', data.locationName ? `eBird Checklist — ${data.locationName} — ${data.date}` : `eBird Checklist — ${data.checklistId || ''}`)
      setter('date', data.date || '')
      setter('startTime', data.startTime || '')
      setter('locationName', data.locationName || '')
      setter('locationId', data.locationId || '')
      setter('latitude', data.latitude)
      setter('longitude', data.longitude)
      setter('region', data.region || '')
      setter('protocol', data.protocol || '')
      setter('duration', data.duration)
      setter('distance', data.distance)
      setter('numberOfObservers', data.numberOfObservers)
      setter('speciesCount', data.speciesCount)
      setter('gpsTrack', data.gpsTrack || [])
      setter('trackDistanceKm', data.trackDistanceKm)
      setter('lastImportedAt', new Date().toISOString())
      setter('rawImportData', data)

      const rows = data.species.map((s: any) => ({
        commonName: s.commonName,
        scientificName: s.scientificName ?? '',
        count: s.count,
        comments: s.comments,
      }))
      setter('species', rows)
      setSuccess('html')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse HTML file.')
    } finally {
      setLoading(null)
    }
  }, [dispatchFields])

  const handleCsvFile = useCallback(async (file: File) => {
    setLoading('csv')
    setError(null)
    setSuccess(false)
    try {
      const text = await file.text()
      const rows = parseCsvSpeciesList(text)
      if (rows.length === 0) throw new Error('Could not find any species in the CSV.')

      dispatchFields({ type: 'UPDATE', path: 'species', value: rows })
      dispatchFields({ type: 'UPDATE', path: 'speciesCount', value: rows.length })
      dispatchFields({ type: 'UPDATE', path: 'lastImportedAt', value: new Date().toISOString() })
      setSuccess('csv')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file.')
    } finally {
      setLoading(null)
    }
  }, [dispatchFields])

  const DropZone = ({ 
    label, 
    refElement, 
    onFile, 
    type, 
    desc 
  }: { 
    label: string, 
    refElement: React.RefObject<HTMLInputElement>, 
    onFile: (f: File) => void, 
    type: 'html' | 'csv', 
    desc: string 
  }) => {
    const isSuccess = success === type
    const isLoading = loading === type

    return (
      <div
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) onFile(file)
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => refElement.current?.click()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1.5rem 1rem',
          border: `2px dashed ${isLoading ? 'var(--theme-elevation-200)' : isSuccess ? 'var(--theme-success-500)' : 'var(--theme-elevation-300)'}`,
          borderRadius: '6px',
          cursor: isLoading ? 'wait' : 'pointer',
          background: isLoading ? 'var(--theme-elevation-25)' : isSuccess ? 'var(--theme-success-50)' : 'transparent',
          transition: 'all 0.15s ease',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>{isLoading ? '⏳' : isSuccess ? '✅' : (type === 'html' ? '🌐' : '📊')}</span>
        <span style={{ fontWeight: 500, color: isSuccess ? 'var(--theme-success-700)' : 'var(--theme-text)' }}>
          {isLoading ? `Parsing ${type}...` : isSuccess ? `${label} imported!` : `Upload ${label}`}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)' }}>{desc}</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.75rem', border: '1px solid var(--theme-elevation-150)', borderRadius: '4px', background: 'var(--theme-elevation-50)' }}>
      <label style={{ color: 'var(--theme-text)', fontSize: '0.875rem', fontWeight: 600 }}>Import from eBird</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <>
          <input ref={htmlInputRef} type="file" accept=".html,.htm,.txt" onChange={(e) => e.target.files?.[0] && handleHtmlFile(e.target.files[0])} style={{ display: 'none' }} />
          <DropZone label="Page Source" refElement={htmlInputRef} onFile={handleHtmlFile} type="html" desc="For GPS tracks & metadata (.html)" />
        </>
        <>
          <input ref={csvInputRef} type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])} style={{ display: 'none' }} />
          <DropZone label="Species List" refElement={csvInputRef} onFile={handleCsvFile} type="csv" desc="For bird counts (.csv)" />
        </>
      </div>
      {error && (
        <div style={{ padding: '0.5rem 0.75rem', background: 'var(--theme-error-100)', color: 'var(--theme-error-700)', borderRadius: '4px', fontSize: '0.8rem' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  )
}
