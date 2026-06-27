// components/PersonalityQuizWrapper.tsx
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const PersonalityQuiz = dynamic(() => import('@/components/PersonalityQuiz'), {
  ssr: false,
})

export default function PersonalityQuizWrapper({ quiz }: { quiz: any }) {
  const [resolvedQuiz, setResolvedQuiz] = useState<any>(quiz)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  if (quiz && typeof quiz === 'number') {
    setLoading(true)
    const url = `/api/quizzes/${quiz}?depth=1`
    console.log('Fetching from:', url)

    fetch(url)
      .then((res) => {
        console.log('Response status:', res.status)
        console.log('Response headers:', res.headers)
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((data) => {
        console.log('Quiz data received:', data)
        setResolvedQuiz(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Fetch error details:', {
          message: err.message,
          stack: err.stack,
          url: url
        })
        setError('Failed to load quiz')
        setLoading(false)
      })
  }
}, [quiz])



  if (loading) return <div className="text-center p-4">Loading quiz...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!resolvedQuiz) return <div className="text-center text-gray-500">No quiz data</div>

  return <PersonalityQuiz quiz={resolvedQuiz} />
}
