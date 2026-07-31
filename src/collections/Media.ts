import type { CollectionConfig } from 'payload'
import sharp from 'sharp'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
      
    ],
    // Don't let Payload's sharp pipeline re-compress the original
    // unnecessarily — we handle that ourselves
    resizeOptions: {
      withoutReduction: false,
    },
  },
    hooks: {
    beforeChange: [
      async ({ req, data }) => {
        if (!req.file || !req.file.data) return

        const fileBuffer = Buffer.from(req.file.data)
        const TWO_MB = 2 * 1024 * 1024

        // Only process if the image exceeds 2MB
        if (fileBuffer.length > TWO_MB) {
          const mimeType = req.file.mimetype || ''

          // Determine output format from the original
          const format = mimeType.includes('png')
            ? 'png'
            : mimeType.includes('webp')
              ? 'webp'
              : 'jpeg'

          let pipeline = sharp(fileBuffer)

          // First pass: try quality 80 and check size
          const compressed = await pipeline
            .clone()
            .toFormat(format, {
              quality: 80,
              ...(format === 'jpeg' ? { mozjpeg: true } : {}),
              ...(format === 'png' ? { compressionLevel: 9 } : {}),
            })
            .toBuffer()

          if (compressed.length <= TWO_MB) {
            req.file.data = compressed
            req.file.size = compressed.length
            console.log(
              `[Media] Compressed ${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB → ${(compressed.length / 1024 / 1024).toFixed(1)}MB (quality 80)`,
            )
            return
          }

          // Second pass: binary-search quality down to hit 2MB
          let low = 10
          let high = 79
          let bestBuffer = compressed
          let attempts = 0

          while (low <= high && attempts < 8) {
            const mid = Math.floor((low + high) / 2)
            const attempt = await sharp(fileBuffer)
              .toFormat(format, {
                quality: mid,
                ...(format === 'jpeg' ? { mozjpeg: true } : {}),
                ...(format === 'png' ? { compressionLevel: 9 } : {}),
              })
              .toBuffer()

            if (attempt.length <= TWO_MB) {
              bestBuffer = attempt
              low = mid + 1 // try higher quality
            } else {
              high = mid - 1 // too big, lower quality
            }
            attempts++
          }

          // Also resize dimensions if quality alone isn't enough
          if (bestBuffer.length > TWO_MB) {
            const metadata = await sharp(fileBuffer).metadata()
            const maxDimension = 2000
            if ((metadata.width || 0) > maxDimension || (metadata.height || 0) > maxDimension) {
              pipeline = sharp(fileBuffer).resize({
                width: Math.min(metadata.width || maxDimension, maxDimension),
                height: Math.min(metadata.height || maxDimension, maxDimension),
                fit: 'inside',
                withoutEnlargement: true,
              })
              bestBuffer = await pipeline
                .toFormat(format, { quality: 80, mozjpeg: true })
                .toBuffer()

              // If still too big, quality search again
              if (bestBuffer.length > TWO_MB) {
                low = 10; high = 79; attempts = 0
                while (low <= high && attempts < 8) {
                  const mid = Math.floor((low + high) / 2)
                  const attempt = await sharp(fileBuffer)
                    .resize({
                      width: Math.min(metadata.width || maxDimension, maxDimension),
                      height: Math.min(metadata.height || maxDimension, maxDimension),
                      fit: 'inside',
                      withoutEnlargement: true,
                    })
                    .toFormat(format, { quality: mid, mozjpeg: true })
                    .toBuffer()
                  if (attempt.length <= TWO_MB) {
                    bestBuffer = attempt
                    low = mid + 1
                  } else {
                    high = mid - 1
                  }
                  attempts++
                }
              }
            }
          }

          req.file.data = bestBuffer
          req.file.size = bestBuffer.length
          console.log(
            `[Media] Compressed ${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB → ${(bestBuffer.length / 1024 / 1024).toFixed(1)}MB`,
          )
        }
      },
    ],
  },
}

