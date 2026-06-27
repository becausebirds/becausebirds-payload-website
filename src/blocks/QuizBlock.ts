import type { Block } from 'payload'

export const QuizBlock: Block = {
  slug: 'quiz-embed',
  labels: {
    singular: 'Quiz',
    plural: 'Quizzes',
  },
  fields: [
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
      label: 'Select a Quiz',
    },
  ],
}
