'use client'

import React from 'react'

interface BirdChecklistProps {
  checklist: {
    title?: string
    ebirdChecklistId?: string
    ebirdUrl?: string
    observer?: string
    date?: string
    startTime?: string
    locationName?: string
    latitude?: number | null
    longitude?: number | null
    region?: string
    protocol?: string
    duration?: number | null
    distance?: number | null
    numberOfObservers?: number | null
    speciesCount?: number
    species?: Array<{
      commonName: string
      scientificName?: string | null
      count?: string
      exotic?: string | null
      hasPhotos?: boolean
      hasAudio?: boolean
      comments?: string
    }>
    notes?: string
  }
}

export function BirdChecklistBlock({ checklist }: BirdChecklistProps) {
  const {
    title,
    ebirdChecklistId,
    ebirdUrl,
    observer,
    date,
    startTime,
    locationName,
    latitude,
    longitude,
    region,
    protocol,
    duration,
    distance,
    numberOfObservers,
    speciesCount,
    species = [],
    notes,
  } = checklist

  const formatDate = (d?: string) => {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const mapUrl =
    latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : null

  return (
    <div className="my-8 rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
      {/* Header */}
      <div className="border-b border-stone-200 bg-stone-50 px-6 py-4 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              {locationName || 'Bird Checklist'}
            </h2>
            {region && (
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                {region}
              </p>
            )}
          </div>
          {ebirdChecklistId && (
            <a
              href={ebirdUrl || `https://ebird.org/checklist/${ebirdChecklistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
            >
              View on eBird ↗
            </a>
          )}
        </div>
      </div>

      {/* Meta Stats */}
      <div className="grid grid-cols-2 gap-4 border-b border-stone-200 px-6 py-4 sm:grid-cols-4 dark:border-stone-700">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Date &amp; Time
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-white">
            {formatDate(date)}
            {startTime && <>, {startTime}</>}
          </p>
        </div>
        {protocol && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Protocol
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-white">
              {protocol}
            </p>
          </div>
        )}
        {typeof duration === 'number' && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Duration
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-white">
              {duration} min
            </p>
          </div>
        )}
        {typeof distance === 'number' && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Distance
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-white">
              {distance.toFixed(1)} mi
            </p>
          </div>
        )}
        {typeof numberOfObservers === 'number' && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Observers
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-white">
              {numberOfObservers}
            </p>
          </div>
        )}
        {speciesCount && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Species
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-white">
              {speciesCount}
            </p>
          </div>
        )}
        {observer && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Observer
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-white">
              {observer}
            </p>
          </div>
        )}
        {mapUrl && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Location
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-semibold text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
            >
              View on Google Maps ↗
            </a>
          </div>
        )}
      </div>

      {/* Species List */}
      <div className="px-6 py-4">
        <h3 className="mb-3 text-lg font-bold text-stone-900 dark:text-white">
          Species Observed ({species.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-700 dark:text-stone-400">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Common Name</th>
                <th className="pb-2 pr-4">Scientific Name</th>
                <th className="pb-2 pr-4 text-right">Count</th>
                <th className="pb-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {species.map((s, i) => (
                <tr
                  key={s.commonName + i}
                  className="border-b border-stone-100 last:border-0 dark:border-stone-800"
                >
                  <td className="py-2 pr-4 text-stone-400">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium text-stone-900 dark:text-white">
                    {s.commonName}
                  </td>
                  <td className="py-2 pr-4 italic text-stone-500 dark:text-stone-400">
                    {s.scientificName}
                  </td>
                  <td className="py-2 pr-4 text-right font-semibold text-stone-900 dark:text-white">
                    {s.count}
                  </td>
                  <td className="py-2 text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      {s.exotic && s.exotic !== 'native' && (
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-xs font-medium"
                          style={{
                            background:
                              s.exotic === 'naturalized'
                                ? '#e0e0e0'
                                : s.exotic === 'provisional'
                                  ? '#f9eee6'
                                  : '#fde8d0',
                            color:
                              s.exotic === 'naturalized'
                                ? '#6a6a6a'
                                : '#bd580a',
                          }}
                        >
                          {s.exotic}
                        </span>
                      )}
                      {s.hasPhotos && <span title="Has photos">📷</span>}
                      {s.hasAudio && <span title="Has audio recording">🎤</span>}
                      {s.comments && (
                        <span className="text-stone-400">— {s.comments}</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personal Notes */}
      {notes && (
        <div className="border-t border-stone-200 px-6 py-4 dark:border-stone-700">
          <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Notes
          </h4>
          <p className="text-sm text-stone-700 dark:text-stone-300">{notes}</p>
        </div>
      )}
    </div>
  )
}
