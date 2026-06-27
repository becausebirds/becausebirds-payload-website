import React from 'react'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type MediumImpactHeroProps = {
  links?: {
    link: React.ComponentProps<typeof CMSLink>
  }[]
  media?: { url?: string; caption?: unknown } | number
  richText?: unknown
}

export const MediumImpactHero: React.FC<MediumImpactHeroProps> = ({ links, media, richText }) => {
  const mediaObj = media && typeof media === 'object' ? (media as { url?: string; caption?: unknown }) : null
  const caption = mediaObj?.caption

  return (
    <div className="">
      <div className="container mb-8">
        {richText ? (
          <RichText className="mb-6" data={richText as DefaultTypedEditorState} enableGutter={false} />
        ) : null}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="container ">
        {mediaObj && (
          <div>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media as any}
            />
            {caption ? (
              <div className="mt-3">
                <RichText data={caption as DefaultTypedEditorState} enableGutter={false} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
