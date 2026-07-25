'use client'
import React, { useState } from 'react'

export const MicropostForm = () => {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('content', content)
    formData.append('alt', alt)
    if (file) formData.append('photo', file)

    try {
      const res = await fetch('/api/micropub', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Micropost created! ✅' })
        setContent('')
        setFile(null)
        setAlt('')
      } else {
        const errorData = await res.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to create post' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error — check your connection' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      {message && (
        <div
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <label>
        Content (max 300)
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={300}
          required
          style={{ width: '100%', minHeight: '100px' }}
        />
      </label>

      <label>
        Image
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>

      <label>
        Alt Text
        <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} style={{ width: '100%' }} />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}
