'use client'

import React, { useState, useRef, useCallback } from 'react'

interface ChecklistResult {
  id: string
  status: 'done' | 'skipped' | 'error'
  detail?: string
}

export const ImportEbirdButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>('')
  const [checklists, setChecklists] = useState<ChecklistResult[]>([])
  const [progress, setProgress] = useState<{ current: number; total: number; imported: number; skipped: number } | null>(null)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const handleImport = async () => {
    if (!confirm('This will fetch new checklists from eBird and import them. Continue?')) {
      return
    }

    setIsLoading(true)
    setResult(null)
    setChecklists([])
    setProgress(null)
    setCurrentStatus('Starting import...')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/import-ebird-checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Import failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const { type, data } = JSON.parse(line.slice(6))

            switch (type) {
              case 'stage': {
                // Lightweight: just update the status from the label
                if (data.label) setCurrentStatus(data.label)
                if (data.detail) setCurrentStatus(data.detail)

                if (
                  (data.status === 'done' || data.status === 'skipped' || data.status === 'error') &&
                  data.id.startsWith('checklist-')
                ) {
                  setChecklists(prev => [
                    ...prev,
                    {
                      id: data.id.replace('checklist-', ''),
                      status: data.status as ChecklistResult['status'],
                      detail: data.detail,
                    },
                  ])
                }
                break
              }
              case 'progress':
  if (data.current !== undefined) {
    // Ensure we are working with numbers, even if the server sends a string
    const current = typeof data.current === 'string' 
      ? parseInt(data.current.split('/')[0], 10) 
      : data.current;

    const total = typeof data.total === 'string' 
      ? parseInt(data.total, 10) 
      : data.total;

    const sanitizedData = { ...data, current, total };

    setProgress(sanitizedData);
    setCurrentStatus(`Processing checklist...`);
  }
  break
case 'complete':
  setResult({ imported: data.imported, skipped: data.skipped, errors: data.errors || [] })
  setIsLoading(false)
  // Add this line to refresh the page:
  window.location.reload()
  break;


            }
          } catch {
            /* skip malformed lines */
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setResult({ imported: 0, skipped: 0, errors: [error.message || 'Import failed'] })
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const progressPercent = progress && progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
      {/* Button row */}
      <div className="py-5 flex items-center justify-center gap-2">
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Importing...' : 'Import eBird Checklists'}
        </button>
        {isLoading && (
          <button
            onClick={() => { abortRef.current?.abort(); setIsLoading(false) }}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Active import view */}
      {isLoading && (
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{currentStatus}</span>
              {progress && (
                <span className="text-zinc-500 font-mono">{progress.current}/{progress.total}</span>
              )}
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              {progress ? (
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              ) : (
                <div className="h-full bg-sky-500 rounded-full animate-pulse" style={{ width: '8%' }} />
              )}
            </div>
          </div>

          {/* Compact tally */}
          {checklists.length > 0 && (
            <p className="text-xs text-zinc-600">
              {progress?.imported || 0} imported · {progress?.skipped || 0} skipped
            </p>
          )}
        </div>
      )}

      {/* Result summary */}
      {result && !isLoading && (
        <div className="rounded-md bg-zinc-950 border border-zinc-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            {result.errors.length > 0 && result.imported === 0 ? (
              <>
                
                <span className="text-sm font-semibold text-red-300">Import Failed</span>
              </>
            ) : (
              <>
                
                <span className="text-sm font-semibold text-zinc-100">Import Complete</span>
              </>
            )}
          </div>
          <div className="flex gap-3 text-xs mt-1">
            <span className="text-emerald-400">{result.imported} imported</span>
            <span className="text-amber-400">{result.skipped} skipped</span>
            {result.errors.length > 0 && (
              <span className="text-red-400">
                {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-400 space-y-0.5 max-h-24 overflow-y-auto">
              {result.errors.map((err, i) => <p key={i}>{err}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
