// src/utilities/sendAdminNotification.ts
import type { CollectionAfterChangeHook } from 'payload'

export const sendAdminNotification: CollectionAfterChangeHook = async ({
  doc,
  operation,
  collection,
  req,
}) => {
  if (operation !== 'create') return

  const slug = collection.slug

  const subject =
    slug === 'comments'
      ? 'New Comment Submitted'
      : slug === 'visitors'
        ? 'New Visitor Record'
        : `New ${slug} record`

  // Build a readable body per collection
  const fields =
    slug === 'comments'
      ? [
          `Author: ${(doc as any).author || '—'}`,
          `Email: ${(doc as any).email || '—'}`,
          `Comment: ${(doc as any).content || '—'}`,
          `Status: Pending`,
        ]
      : slug === 'visitors'
        ? [
            `Name: ${(doc as any).name || '—'}`,
            `Location: ${(doc as any).location || '—'}`,
            `Favorite Bird: ${(doc as any).favoriteBird || '—'}`,
            `Message: ${(doc as any).message || '—'}`,
          ]
        : [JSON.stringify(doc, null, 2)]

  const body = [
    `A new record was submitted on your site.`,
    ``,
    ...fields,
    ``,
    `───`,
    `ID: ${(doc as any).id}`,
    `Date: ${new Date().toLocaleString()}`,
  ].join('\n')

  const htmlFields =
    slug === 'comments'
      ? `
        <table style="font-family:sans-serif; border-collapse:collapse;">
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Author</td><td>${(doc as any).author || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Email</td><td>${(doc as any).email || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Comment</td><td>${(doc as any).content || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Status</td><td><span style="color:#e67e22;">Pending</span></td></tr>
        </table>`
      : slug === 'visitors'
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
    html: `
      <html>
        <body style="font-family:sans-serif; padding:24px;">
          <h2 style="margin-top:0;">${subject}</h2>
          <p>A new record was submitted on your site.</p>
          ${htmlFields}
          <hr style="margin-top:20px; border:none; border-top:1px solid #ddd;"/>
          <p style="color:#666; font-size:13px;">
            ID: ${(doc as any).id} &middot; ${new Date().toLocaleString()}
          </p>
        </body>
      </html>`,
    text: body,
  })
}
