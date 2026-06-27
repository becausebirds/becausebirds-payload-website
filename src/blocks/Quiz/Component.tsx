'use client'

import React from 'react'
import PersonalityQuiz from '@/components/PersonalityQuiz'
import type { Quiz as QuizType } from '@/payload-types'

interface QuizBlockProps {
  blockType: 'quiz-embed'
  quiz: QuizType | string
  disableInnerContainer?: boolean
}

export const QuizBlock: React.FC<QuizBlockProps> = ({ quiz, disableInnerContainer }) => {
  // Handle case where quiz is a string ID (relationship not populated)
  if (typeof quiz === 'string') {
    return <div className="text-center text-red-500">Quiz not loaded properly</div>
  }

  // If quiz data is not available
  if (!quiz) {
    return <div className="text-center text-gray-500">No quiz selected</div>
  }

  return (
    <div className={!disableInnerContainer ? 'container' : ''}>
      <PersonalityQuiz quiz={quiz} />
    </div>
  )
}
