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
  if (!slug) {
    return null
  }

  // 1. Get your frontend URL from environment variables
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  const encodedSlug = encodeURIComponent(slug)

  const encodedParams = new URLSearchParams({
    path: `/${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  // 2. Prepend the baseUrl to the relative path
  const url = `${baseUrl}/next/preview?${encodedParams.toString()}`

  return url
}