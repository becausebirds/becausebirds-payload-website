// src/utilities/sendAdminNotification.ts
import type { CollectionAfterChangeHook } from 'payload'

const getTitle = (record: any) =>
  record?.title || record?.name || record?.subject || 'Untitled document'

export const sendAdminNotification: CollectionAfterChangeHook = async ({
  doc,
  operation,
  collection,
  req,
  previousDoc,
}) => {
  const slug = collection.slug

  // ── COMMENTS ──────────────────────────────────────────────────────────
  if (slug === 'comments') {
    const status = (doc as any).status
    const isApproved = status === 'approved'

    // Also let the admin know when a reply is approved (status change or new)
    const becameApproved =
      isApproved &&
      (operation === 'create' || (previousDoc as any)?.status !== 'approved')

    // 1) Notify the admin when a brand-new comment is submitted
    if (operation === 'create') {
      const subject = 'New Comment Submitted'
      const title = getTitle(doc)

      const fields = [
        `Title: ${title}`,
        `Author: ${(doc as any).author || '—'}`,
        `Email: ${(doc as any).email || '—'}`,
        `Comment: ${(doc as any).content || '—'}`,
        `Status: ${status === 'approved' ? 'Approved' : 'Pending'}`,
      ]

      const htmlFields = `
        <table style="font-family:sans-serif; border-collapse:collapse;">
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Title</td><td>${title}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Author</td><td>${(doc as any).author || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Email</td><td>${(doc as any).email || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Comment</td><td>${(doc as any).content || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Status</td><td>${status === 'approved' ? '<span style="color:#27ae60;">Approved</span>' : '<span style="color:#e67e22;">Pending</span>'}</td></tr>
        </table>`

      await req.payload.sendEmail({
        to: process.env.ADMIN_EMAIL || 'jeff@becausebirds.com',
        subject,
        html: renderAdminHtml({ subject, title, htmlFields, doc }),
        text: renderAdminText({ title, fields, doc }),
      })
    }

    // 2) Notify the original commenter when their comment receives an
    //    approved reply
    const parentId = (doc as any).parent as string | undefined
    if (parentId && becameApproved) {
      try {
        const parent = (await req.payload.findByID({
          collection: 'comments',
          id: parentId,
          depth: 0,
        })) as any

        const parentEmail = parent?.email as string | undefined
        const siteName = process.env.SITE_NAME || 'the site'

        if (parentEmail) {
          const replySubject = `New reply to your comment on ${siteName}`

          await req.payload.sendEmail({
            to: parentEmail,
            subject: replySubject,
            html: `
              <html>
                <body style="font-family:sans-serif; padding:24px;">
                  <h2 style="margin-top:0;">You have a new reply</h2>
                  <p><strong>${(doc as any).author || 'Someone'}</strong> replied to your comment:</p>
                  <table style="font-family:sans-serif; border-collapse:collapse;">
                    <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Replied by</td><td>${(doc as any).author || '—'}</td></tr>
                    <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Reply</td><td>${(doc as any).content || '—'}</td></tr>
                    <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Date</td><td>${new Date().toLocaleString()}</td></tr>
                  </table>
                  <hr style="margin-top:20px; border:none; border-top:1px solid #ddd;"/>
                  <p style="color:#666; font-size:13px;">Reply ID: ${(doc as any).id}</p>
                </body>
              </html>`,
            text: [
              `You have a new reply on ${siteName}.`,
              ``,
              `Replied by: ${(doc as any).author || '—'}`,
              `Reply: ${(doc as any).content || '—'}`,
              `Date: ${new Date().toLocaleString()}`,
              ``,
              `Reply ID: ${(doc as any).id}`,
            ].join('\n'),
          })
        }
      } catch (err) {
  req.payload.logger?.error?.(
    `sendAdminNotification: could not notify commenter for comment ${(doc as any).id}: ${(err as Error)?.message ?? err}`
  )
}

    }

    return
  }

  // ── OTHER COLLECTIONS (visitors, etc.) ───────────────────────────────
  if (operation !== 'create') return

  const title = getTitle(doc)
  const subject =
    slug === 'visitors'
      ? 'New Visitor Record'
      : `New ${slug} record`

  const fields =
    slug === 'visitors'
      ? [
          `Name: ${(doc as any).name || '—'}`,
          `Location: ${(doc as any).location || '—'}`,
          `Favorite Bird: ${(doc as any).favoriteBird || '—'}`,
          `Message: ${(doc as any).message || '—'}`,
        ]
      : [JSON.stringify(doc, null, 2)]

  const htmlFields =
    slug === 'visitors'
      ? `
        <table style="font-family:sans-serif; border-collapse:collapse;">
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Name</td><td>${(doc as any).name || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Location</td><td>${(doc as any).location || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Favorite Bird</td><td>${(doc as any).favoriteBird || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Message</td><td>${(doc as any).message || '—'}</td></tr>
        </table>`
      : `<pre>${JSON.stringify(doc, null, 2)}</pre>`

  await req.payload.sendEmail({
    to: process.env.ADMIN_EMAIL || 'jeff@becausebirds.com',
    subject,
    html: renderAdminHtml({ subject, title, htmlFields, doc }),
    text: renderAdminText({ title, fields, doc }),
  })
}

// ── Shared render helpers ───────────────────────────────────────────────
function renderAdminText({ title, fields, doc }: { title: string; fields: string[]; doc: any }) {
  return [
    `A new record was submitted on your site.`,
    ``,
    `Title: ${title}`,
    ...fields,
    ``,
    `───`,
    `ID: ${(doc as any).id}`,
    `Date: ${new Date().toLocaleString()}`,
  ].join('\n')
}

function renderAdminHtml({ subject, title, htmlFields, doc }: { subject: string; title: string; htmlFields: string; doc: any }) {
  return `
    <html>
      <body style="font-family:sans-serif; padding:24px;">
        <h2 style="margin-top:0;">${subject}</h2>
        <p>A new record was submitted on your site.</p>
        <table style="font-family:sans-serif; border-collapse:collapse;">
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Title</td><td>${title}</td></tr>
        </table>
        ${htmlFields}
        <hr style="margin-top:20px; border:none; border-top:1px solid #ddd;"/>
        <p style="color:#666; font-size:13px;">
          ID: ${(doc as any).id} &middot; ${new Date().toLocaleString()}
        </p>
      </body>
    </html>`
}
