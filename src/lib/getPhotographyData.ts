import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface PhotoWithChecklist {
  id: string
  url: string | null
  filename: string | null
  alt: string | null
  rating: number | null
  mediaNotes: string | null
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

export async function getPhotographyData(): Promise<{
  photos: PhotoWithChecklist[]
  total: number
}> {
  const payload = await getPayload({ config: configPromise })

  // Fetch ALL images (up to 1000) so client-side sorting works on the full set
  const result = await payload.find({
    collection: 'bird-media',
    depth: 2,
    limit: 1000,
    sort: '-createdAt',
    where: {
      mimeType: { contains: 'image' },
    },
  })

  return {
    photos: result.docs as unknown as PhotoWithChecklist[],
    total: result.totalDocs,
  }
}
