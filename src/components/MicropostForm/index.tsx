// components/MicropostForm/index.tsx
'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'

export const MicropostForm = () => {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
        toast.success('Micropost created!')
        setContent('')
        setFile(null)
        setAlt('')
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to create post')
      }
    } finally {
      setLoading(false)
    }
  }

  // --- ADD THIS RETURN STATEMENT ---
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
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
