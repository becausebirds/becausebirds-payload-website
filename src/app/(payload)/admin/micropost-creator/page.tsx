// app/(payload)/admin/micropost-creator/page.tsx
import React from 'react'
import { MicropostForm } from '@/components/MicropostForm' // Adjust your import path
import { Gutter } from '@payloadcms/ui/elements/Gutter'

export default function MicropostCreatorPage() {
  return (
    <Gutter>
      <h1>Create Micropost</h1>
      <MicropostForm />
    </Gutter>
  )
}
