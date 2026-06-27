import { cookies } from 'next/headers'

export async function isPayloadUserAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.has('payload-token')
}
