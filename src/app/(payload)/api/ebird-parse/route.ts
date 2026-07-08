import { NextRequest, NextResponse } from 'next/server'
import { parseEbirdChecklistHtml } from '@/lib/ebird-parser'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing "url" in request body.' }, { status: 400 })
    }

    const checklistMatch = url.match(/^https?:\/\/(?:www\.)?ebird\.org\/checklist\/(S\d+)/i)
    if (!checklistMatch) {
      return NextResponse.json({ error: 'Invalid eBird checklist URL.' }, { status: 400 })
    }

    const checklistId = checklistMatch[1]
    console.log(`[ebird-parse] Fetching ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        error: `eBird returned HTTP ${response.status} ${response.statusText}`,
        httpStatus: response.status,
      }, { status: 502 })
    }

    const html = await response.text()
    console.log(`[ebird-parse] Got ${html.length} bytes of HTML`)

    const data = parseEbirdChecklistHtml(html)

    // Always return data + debug info
    return NextResponse.json({
      success: data.species.length > 0,
      checklistId,
      speciesFound: data.species.length,
      data,
      htmlLength: html.length,
      htmlPreview: html.substring(0, 3000), // First 3K of HTML for inspection
      // Also include the species section HTML
      speciesHtmlPreview: null,
    })
  } catch (error) {
    console.error('[ebird-parse] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unexpected error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
