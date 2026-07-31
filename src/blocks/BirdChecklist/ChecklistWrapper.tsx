import BirdChecklistComponent from './Component'

async function getChecklist(id: string) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
  if (!serverUrl) return null
  const apiUrl = `${serverUrl}/api/bird-checklists/${id}?depth=1`
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function BirdChecklistWrapper({ block }: { block: any }) {
  if (!block) {
    return <BirdChecklistComponent checklistData={null} />
  }

  const { checklist, ...props } = block

  let checklistId: string | null = null

  if (typeof checklist === 'string') {
    checklistId = checklist
  } else if (checklist && typeof checklist.id === 'string') {
    checklistId = checklist.id
  } else if (checklist && typeof checklist.id === 'number') {
    checklistId = String(checklist.id)
  } else if (checklist && checklist.value) {
    checklistId = typeof checklist.value === 'string'
      ? checklist.value
      : checklist.value?.id
        ? String(checklist.value.id)
        : null
  } else if (checklist && checklist.id === undefined && checklist._id) {
    checklistId = checklist._id
  }

  if (!checklistId) {
    return <BirdChecklistComponent checklistData={null} {...props} />
  }

  const data = await getChecklist(checklistId)

  return <BirdChecklistComponent checklistData={data} {...props} />
}
