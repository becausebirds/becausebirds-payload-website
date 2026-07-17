import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const paths = request.nextUrl.searchParams.getAll('path')
  //                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                getAll() returns an array of ALL `path` values

  if (paths.length === 0) {
    return Response.json({ message: 'Missing path' }, { status: 400 })
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  return Response.json({ revalidated: true, paths })
}
