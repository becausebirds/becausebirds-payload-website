import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '',
  pages: '',
  'bird-checklists': 'bird-checklists',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug?: string | null
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (!slug) return null

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const prefix = collectionPrefixMap[collection] ?? ''
  const encodedSlug = encodeURIComponent(slug)

  // Build the path without a double slash when prefix is empty
  const path = prefix
    ? `/${prefix}/${encodedSlug}`
    : `/${encodedSlug}`

  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  return `${baseUrl}/next/preview?${encodedParams.toString()}`
}
