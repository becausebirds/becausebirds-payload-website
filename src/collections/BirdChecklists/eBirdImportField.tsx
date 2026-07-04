'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useField, useForm } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { parseEbirdChecklistHtml } from '@/lib/ebird-parser'

export const EbirdImportFieldClient: TextFieldClientComponent = (props) => {
  const { path } = props
  const { value, setValue } = useField<string>({ path: path! })
  const { dispatchFields } = useForm()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(false)
    setFileName(file.name)

    try {
      const text = await file.text()
      const data = parseEbirdChecklistHtml(text)

      if (!data.species || data.species.length === 0) {
        setError(
          'Could not find any species in the file. Make sure you saved the full page source of an eBird checklist.',
        )
        return
      }

      const setField = (fieldName: string, val: any) => {
        dispatchFields({ type: 'UPDATE', path: fieldName, value: val })
      }

      setField('ebirdChecklistId', data.checklistId || '')
      setField('title', data.locationName
        ? `eBird Checklist — ${data.locationName} — ${data.date}`
        : `eBird Checklist — ${data.checklistId || ''}`
      )
      setField('observer', data.observer || '')
      setField('date', data.date || '')
      setField('startTime', data.startTime || '')
      setField('locationName', data.locationName || '')
      setField('locationId', data.locationId || '')
      setField('latitude', data.latitude)
      setField('longitude', data.longitude)
      setField('region', data.region || '')
      setField('protocol', data.protocol || '')
      setField('duration', data.duration)
      setField('distance', data.distance)
      setField('numberOfObservers', data.numberOfObservers)
      setField('speciesCount', data.speciesCount)
      setField('gpsTrack', data.gpsTrack || [])
      setField('trackDistanceKm', data.trackDistanceKm)
      setField('species', (data.species || []).map((s: any, i: number) => ({
        id: `new-${i}`,
        commonName: s.commonName,
        scientificName: s.scientificName,
        count: s.count,
        exotic: s.exotic,
        hasPhotos: s.hasPhotos,
        hasAudio: s.hasAudio,
        comments: s.comments,
      })))
      setField('lastImportedAt', new Date().toISOString())
      setField('rawImportData', data)

      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to parse the file.',
      )
    } finally {
      setLoading(false)
    }
  }, [dispatchFields])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0.75rem',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <label
        style={{
          color: 'var(--theme-text)',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Import from eBird Page Source File
      </label>

      {/* Drop zone / file picker */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '2rem 1rem',
          border: `2px dashed ${
            loading
              ? 'var(--theme-elevation-200)'
              : success
                ? 'var(--theme-success-500)'
                : 'var(--theme-elevation-300)'
          }`,
          borderRadius: '6px',
          cursor: loading ? 'wait' : 'pointer',
          background: loading
            ? 'var(--theme-elevation-25)'
            : success
              ? 'var(--theme-success-50)'
              : 'transparent',
          transition: 'all 0.15s ease',
          textAlign: 'center',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.txt"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {loading ? (
          <>
            <span style={{ fontSize: '2rem' }}>⏳</span>
            <span style={{ fontWeight: 500, color: 'var(--theme-text)' }}>
              Parsing file...
            </span>
          </>
        ) : success ? (
          <>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <span style={{ fontWeight: 500, color: 'var(--theme-success-700)' }}>
              {fileName ? `${fileName} — imported!` : 'Imported successfully!'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-500)' }}>
              Click or drop another file to re-import
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '2rem' }}>📄</span>
            <span style={{ fontWeight: 500, color: 'var(--theme-text)' }}>
              Drop page source file here
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-500)' }}>
              or click to browse &mdash; .html .htm .txt
            </span>
          </>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--theme-error-100)',
            color: 'var(--theme-error-700)',
            borderRadius: '4px',
            fontSize: '0.8rem',
          }}
        >
          ⚠ {error}
        </div>
      )}

      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-500)',
        }}
      >
        1. Go to your eBird checklist page &middot;{' '}
        2. Right-click and <strong>Save Page As...</strong> (Webpage, HTML only) &middot;{' '}
        3. Drop the saved file here to auto-fill all fields
      </p>
    </div>
  )
}
