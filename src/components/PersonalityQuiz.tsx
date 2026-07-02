'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState, SerializedLexicalNode } from
  '@payloadcms/richtext-lexical/lexical'
import type { Quiz } from '@/payload-types'

interface QuizComponentProps {
  quiz: Quiz
}

export default function PersonalityQuiz({ quiz }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = quiz.questions?.[currentQuestionIndex]
  const totalQuestions = quiz.questions?.length || 1
  const progress = (currentQuestionIndex / totalQuestions) * 100

  const handleAnswerSelect = (personalityId: string) => {
    const newAnswers = [...answers, personalityId]
    setAnswers(newAnswers)

    if (currentQuestionIndex >= totalQuestions - 1) {
      const scores: Record<string, number> = {}
      newAnswers.forEach((id) => {
        scores[id] = (scores[id] || 0) + 1
      })
      const topPersonalityId = Object.entries(scores).sort(([, a], [, b]) => b -
        a)[0]?.[0]
      const resultPersonality = quiz.personalities?.[Number(topPersonalityId)]

      if (resultPersonality) {
        setIsComplete(true)
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) return
    setCurrentQuestionIndex((prev) => prev - 1)
    setAnswers((prev) => prev.slice(0, -1))
  }

  const resultPersonality = useMemo(() => {
    if (!isComplete || !answers.length) return null

    const scores: Record<string, number> = {}
    answers.forEach((personalityId) => {
      scores[personalityId] = (scores[personalityId] || 0) + 1
    })

    const topPersonalityId = Object.entries(scores).sort(([, a], [, b]) => b -
      a)[0]?.[0]
    return quiz.personalities?.[Number(topPersonalityId)]
  }, [isComplete, answers, quiz.personalities])

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setAnswers([])
    setIsComplete(false)
  }

  if (isComplete && resultPersonality) {
    return <ResultScreen personality={resultPersonality}
                         onRestart={handleRestart} />
  }

  return (
    <div className="min-h-screen bg-background pt-2 p-0 sm:p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-bold text-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-bold text-
foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {currentQuestion && (
          <Card className="border-4 border-border bg-card p-0">
            {currentQuestion.featuredImage && (
              <div className="flex justify-center pt-4">
                <Image
                  src={
                    typeof currentQuestion.featuredImage === 'string'
                      ? currentQuestion.featuredImage
                      : typeof currentQuestion.featuredImage === 'object' &&
                        'url' in currentQuestion.featuredImage
                        ? currentQuestion.featuredImage.url || ''
                        : ''
                  }
                  alt={currentQuestion.title}
                  width={150}
                  height={100}
                  className="rounded-base mt-0 mb-0 h-auto w-36 object-cover
                    sm:w-44"
                />
              </div>
            )}

            <h2 className="px-1 pt-0 pb-0 mt-0 mb-0 text-center text-lg font-
black
              text-foreground sm:text-3xl">{currentQuestion.title}</h2>

            <div className="flex flex-col items-center space-y-3 px-2 pb-1 mb-5
              sm:space-y-4 sm:px-6">
              {currentQuestion.answers?.map((answer, index) => (
                <Button
                  key={index}
                  onClick={() =>
                    handleAnswerSelect(String(answer.personalityIndex))}
                  size="sm"
                  className="h-12 w-full whitespace-normal break-word px-1 text-
center sm:p-4"
                >
                  {answer.title}
                </Button>
              ))}
            </div>

            {currentQuestionIndex > 0 && (
              <div className="flex justify-center pb-4">
                <Button
                  onClick={handlePrevious}
                  variant="neutral"
                  size="sm"
                  className="px-6"
                >
                  ← Previous
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

interface ResultScreenProps {
  personality: {
    id?: string | null
    title: string
    image?: number | { url?: string | null } | null
    description?: unknown
  }
  onRestart: () => void
}

function ResultScreen({ personality, onRestart }: ResultScreenProps) {
  return (
    <div className="min-h-screen bg-background pt-2 p-1 sm:p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-1 text-center">
          <div className="mx-auto h-1 w-24 bg-muted-foreground/40" />
        </div>

        <Card className="border-4 border-border bg-card p-0">
          {personality.image && (
            <div className="overflow-hidden">
              <Image
                src={
                  typeof personality.image === 'string'
                    ? personality.image
                    : typeof personality.image === 'object' && 'url' in
                      personality.image
                      ? personality.image.url || ''
                      : ''
                }
                alt={personality.title}
                width={600}
                height={400}
                className="h-auto w-full mt-0 mb-0"
              />
            </div>
          )}

          <h2 className="mb-0 mt-0 px-3 text-3xl text-center font-black
            text-foreground sm:text-4xl">{personality.title}</h2>

          {personality.description ? (
            <div className="prose prose-sm dark:prose-invert px-3 mt-0 mb-0 max-
w-none sm:prose-base">
              <RichText data={personality.description as
                SerializedEditorState<SerializedLexicalNode>} />
            </div>
          ) : null}

          <Button onClick={onRestart} className="block mx-auto mb-5">
            ↻ Take Quiz Again
          </Button>
        </Card>
      </div>
    </div>
  )
}
