// RichText/LazyBlocks.client.tsx
'use client'

import dynamic from 'next/dynamic'

export const LazyQuiz = dynamic(
  () => import('@/components/PersonalityQuizWrapper'),
  { ssr: false },
)

export const LazyBarChart = dynamic(
  () => import('@/blocks/BarChart/Component'),
  { ssr: false },
)

export const LazyPieChart = dynamic(
  () => import('@/blocks/PieChart/Component'),
  { ssr: false },
)

export const LazyMap = dynamic(
  () => import('@/blocks/MapBlock/Component'),
  { ssr: false },
)

