import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface PhotoWithChecklist {
  id: string
  url: string | null
  width: number
  height: number
  filename: string | null
  alt: string | null
  rating: number | null
  mediaNotes: string | null
  sizes?: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  }
  species: { id: string; comName?: string; sciName?: string }[] | null
  checklistId:
    | {
        id: string
        slug?: string | null
        ebirdChecklistId?: string | null
        date?: string | null
        locationName?: string | null
        state?: string | null
        county?: string | null
        latitude?: number | null
        longitude?: number | null
      }
    | string
    | null
}

export async function getPhotographyData(): Promise<PhotoWithChecklist[]> {
  const payload = await getPayload({ config: configPromise })

  // Use the 'sort' parameter to order by the related checklist's date.
  // Note: Payload supports dot-notation for sorting by related fields.
  const result = await payload.find({
    collection: 'bird-media',
    depth: 2,
    limit: 500,
    sort: '-checklistId.date', // Sort by checklist date descending
    where: {
      mimeType: { contains: 'image' },
    },
  })

  return result.docs as unknown as PhotoWithChecklist[]
}


function getChecklistDate(photo: PhotoWithChecklist): string | null {
  if (photo.checklistId && typeof photo.checklistId === 'object') {
    return photo.checklistId.date ?? null
  }
  return null
}
