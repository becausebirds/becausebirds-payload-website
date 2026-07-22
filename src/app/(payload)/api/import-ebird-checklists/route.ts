import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import {
  fetchEBirdChecklistLinks,
  fetchChecklistFromAPI,
  extractChecklistHTMLData,
  fetchAllBirds,
  transformEBirdData,
  checklistExists,
  createChecklist,
} from '@/utilities/ebird-import'

export const POST = async (req: NextRequest) => {
  try {
    const ebirdUsername = process.env.EBIRD_USERNAME
    const ebirdPassword = process.env.EBIRD_PASSWORD
    const ebirdApiToken = process.env.EBIRD_API_TOKEN

    if (!ebirdUsername || !ebirdPassword || !ebirdApiToken) {
      return NextResponse.json(
        {
          message: 'Missing eBird credentials. Set EBIRD_USERNAME, EBIRD_PASSWORD, and EBIRD_API_TOKEN.',
        },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        const sendMessage = (type: string, data: any) => {
          const message = `data: ${JSON.stringify({ type, data })}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        try {
          sendMessage('status', { message: 'Fetching eBird checklist links...' })
          const ebirdChecklists = await fetchEBirdChecklistLinks(ebirdUsername, ebirdPassword)

          sendMessage('status', {
            message: `Found ${ebirdChecklists.length} checklists on eBird`,
          })

          // FETCH BIRDS ONCE before processing checklists
          sendMessage('status', { message: 'Loading bird database...' })
          const { byScientificName, byCommonName, bySpeciesCode } = await fetchAllBirds(payload)
          sendMessage('status', {
            message: `Bird database loaded: ${Object.keys(byScientificName).length} species`,
          })

          let imported = 0
          let skipped = 0
          const errors: string[] = []

          for (let i = 0; i < ebirdChecklists.length; i++) {
            const ebirdChecklist = ebirdChecklists[i]

            try {
              sendMessage('progress', {
                current: i + 1,
                total: ebirdChecklists.length,
                checklistId: ebirdChecklist.checklistId,
                message: `Checking ${ebirdChecklist.checklistId}...`,
              })

              const exists = await checklistExists(ebirdChecklist.checklistId, payload, true)

              if (exists) {
                sendMessage('progress', {
                  current: i + 1,
                  total: ebirdChecklists.length,
                  checklistId: ebirdChecklist.checklistId,
                  message: `⏭️ Skipping ${ebirdChecklist.checklistId} (already imported)`,
                })
                skipped++
                continue
              }

              sendMessage('progress', {
                current: i + 1,
                total: ebirdChecklists.length,
                checklistId: ebirdChecklist.checklistId,
                message: `📥 Fetching data for ${ebirdChecklist.checklistId}...`,
              })

              const apiData = await fetchChecklistFromAPI(ebirdChecklist.checklistId, ebirdApiToken)

              // EXTRACT HTML DATA (includes GPS track, duration, distance, etc.)
              sendMessage('progress', {
                current: i + 1,
                total: ebirdChecklists.length,
                checklistId: ebirdChecklist.checklistId,
                message: `🗺️  Extracting checklist metadata for ${ebirdChecklist.checklistId}...`,
              })

              const htmlData = await extractChecklistHTMLData(
                ebirdChecklist.checklistId,
                ebirdUsername,
                ebirdPassword,
                true // debug flag
              )

              sendMessage('progress', {
                current: i + 1,
                total: ebirdChecklists.length,
                checklistId: ebirdChecklist.checklistId,
                message: `🔄 Transforming checklist ${ebirdChecklist.checklistId}...`,
              })

              // PASS HTML DATA TO TRANSFORM FUNCTION
              const checklistData = await transformEBirdData(
                apiData,
                htmlData,
                byScientificName,
                byCommonName,
                bySpeciesCode,
                true // debug flag
              )

              sendMessage('progress', {
                current: i + 1,
                total: ebirdChecklists.length,
                checklistId: ebirdChecklist.checklistId,
                message: `💾 Creating checklist ${ebirdChecklist.checklistId}...`,
              })

              const created = await createChecklist(checklistData, payload, true)

              imported++

              sendMessage('progress', {
                current: i + 1,
                total: ebirdChecklists.length,
                checklistId: ebirdChecklist.checklistId,
                message: `✅ Imported ${ebirdChecklist.checklistId}`,
              })
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error)
              console.error(`✗ Error importing ${ebirdChecklist.checklistId}:`, errorMsg)
              errors.push(`${ebirdChecklist.checklistId}: ${errorMsg}`)

              sendMessage('progress', {
                current: i + 1,
                total: ebirdChecklists.length,
                checklistId: ebirdChecklist.checklistId,
                message: `❌ Error: ${errorMsg}`,
              })
            }
          }

          sendMessage('complete', {
            message: `Import complete: ${imported} imported, ${skipped} skipped`,
            imported,
            skipped,
            errors,
          })

          controller.close()
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          sendMessage('error', { message: errorMsg })
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    )
  }
}