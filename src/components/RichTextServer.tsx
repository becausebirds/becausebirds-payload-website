// components/RichTextServer.tsx
// ⚡ Pure server-side lexical renderer — ZERO client JavaScript
// Replaces @payloadcms/richtext-lexical/react's ConvertRichText for static pages.

import React from 'react'
import { cn } from '@/utilities/ui'

// ── Block components ──
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CodeBlock } from '@/blocks/Code/Component'
import { HTMLBlockSerializer } from '@/components/RichText/Serializers/HTMLBlock'

// ── Converters (server-renderable) ──
import { HeadingConverter } from '@/blocks/converters/HeadingConverter'
import { ParagraphConverter } from '@/blocks/converters/ParagraphConverter'
import { ImageConverter } from '@/blocks/converters/ImageConverter'
import { QuoteConverter } from '@/blocks/converters/QuoteConverter'
import { AudioConverter } from '@/blocks/converters/AudioConverter'
import { VideoConverter } from '@/blocks/converters/VideoConverter'
import { ListConverter } from '@/blocks/converters/ListConverter'
import { HTMLConverter } from '@/blocks/converters/HTMLConverter'
import { SeparatorConverter } from '@/blocks/converters/SeparatorConverter'
import { SpacerConverter } from '@/blocks/converters/SpacerConverter'
import { GalleryConverter } from '@/blocks/converters/GalleryConverter'
import { EmbedConverter } from '@/blocks/converters/EmbedConverter'
import { ColumnsConverter } from '@/blocks/converters/ColumnsConverter'
import { GroupConverter } from '@/blocks/converters/GroupConverter'
import { DetailsConverter } from '@/blocks/converters/DetailsConverter'
import { PullquoteConverter } from '@/blocks/converters/PullquoteConverter'
import { ButtonsConverter } from '@/blocks/converters/ButtonsConverter'

// ── Lazy interactive blocks (client-only, loaded on demand) ──
import {
  LazyQuiz,
  LazyBarChart,
  LazyPieChart,
  LazyMap,
  LazyBirdChecklist,
} from '@/components/RichText/LazyBlocks.client'

// ── Types ──
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// ── Helper: null → undefined ──
const nullToUndefined = <T,>(obj: T): T => {
  if (obj === null) return undefined as unknown as T
  if (Array.isArray(obj)) return obj.map(nullToUndefined) as unknown as T
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = nullToUndefined(value)
    }
    return result as T
  }
  return obj
}

// ── Render inline nodes as HTML strings (for dangerouslySetInnerHTML) ──
function renderInlineHtml(node: any, _key: number): string {
  if (!node) return ''

  if (node.type === 'text') {
    let text = node.text ?? ''
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.strikethrough) text = `<s>${text}</s>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.code) text = `<code>${text}</code>`
    return text
  }

  if (node.type === 'link') {
    const href =
      node.fields?.url ||
      (node.fields?.doc?.value?.slug
        ? node.fields.relationTo === 'posts'
          ? `/posts/${node.fields.doc.value.slug}`
          : `/${node.fields.doc.value.slug}`
        : '#')
    const children =
      node.children
        ?.map((c: any, i: number) => renderInlineHtml(c, i))
        .join('') || ''
    const newTab = node.fields?.newTab
      ? ' target="_blank" rel="noopener noreferrer"'
      : ''
    return `<a href="${href}"${newTab}>${children}</a>`
  }

  if (node.type === 'listitem') {
    return (
      node.children
        ?.map((c: any, i: number) => renderInlineHtml(c, i))
        .join('') || ''
    )
  }

  if (node.type === 'linebreak') return '<br />'

  return node.text ?? ''
}

// ── Render a single lexical node to a React element ──
function renderNode(node: any, key: number): React.ReactNode {
  if (!node) return null

  switch (node.type) {
    // ── Text node ──
    case 'text': {
      let text = node.text ?? ''
      if (node.bold) text = `<strong>${text}</strong>`
      if (node.italic) text = `<em>${text}</em>`
      if (node.strikethrough) text = `<s>${text}</s>`
      if (node.underline) text = `<u>${text}</u>`
      if (node.code) text = `<code>${text}</code>`
      return <span key={key} dangerouslySetInnerHTML={{ __html: text }} />
    }

    // ── Link ──
    case 'link': {
      const href =
        node.fields?.url ||
        (node.fields?.doc?.value?.slug
          ? node.fields.relationTo === 'posts'
            ? `/posts/${node.fields.doc.value.slug}`
            : `/${node.fields.doc.value.slug}`
          : '#')
      const newTab = node.fields?.newTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : ''
      const children =
        node.children
          ?.map((c: any, i: number) => renderInlineHtml(c, i))
          .join('') || ''
      return (
        <span
          key={key}
          dangerouslySetInnerHTML={{
            __html: `<a href="${href}"${newTab}>${children}</a>`,
          }}
        />
      )
    }

    // ── List item ──
    case 'listitem': {
      const children =
        node.children
          ?.map((c: any, i: number) => renderInlineHtml(c, i))
          .join('') || ''
      return <li key={key} dangerouslySetInnerHTML={{ __html: children }} />
    }

    // ── Heading ──
    case 'heading': {
      const tag = node.tag || 'h2'
      const children =
        node.children
          ?.map((c: any, i: number) => renderInlineHtml(c, i))
          .join('') || ''
      return React.createElement(tag, {
        key,
        className: 'scroll-m-20',
        dangerouslySetInnerHTML: { __html: children },
      })
    }

    // ── Paragraph ──
    case 'paragraph': {
      const children =
        node.children
          ?.map((c: any, i: number) => renderInlineHtml(c, i))
          .join('') || ''
      return <p key={key} dangerouslySetInnerHTML={{ __html: children }} />
    }

    // ── List (ordered / unordered) ──
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      const children = node.children
        ?.map((c: any, i: number) => renderNode(c, i))
        .filter(Boolean)
      return React.createElement(
        tag,
        { key, className: node.listType === 'number' ? 'list-decimal ml-6' : 'list-disc ml-6' },
        children,
      )
    }

    // ── Blockquote ──
    case 'quote': {
      const children =
        node.children
          ?.map((c: any, i: number) => renderInlineHtml(c, i))
          .join('') || ''
      return (
        <blockquote
          key={key}
          className="border-l-4 border-gray-300 pl-4 italic my-4"
          dangerouslySetInnerHTML={{ __html: children }}
        />
      )
    }

    // ── Horizontal rule ──
    case 'horizontalrule':
      return <hr key={key} className="my-8 border-gray-300 dark:border-gray-600" />

    // ── Line break ──
    case 'linebreak':
      return <br key={key} />

    // ── Upload (inline image) ──
    case 'upload': {
      const { url, alt } = node.value || {}
      if (!url) return null
      return (
        <img
          key={key}
          src={url}
          alt={alt || ''}
          className="mx-auto my-6 rounded-lg max-w-full h-auto"
          loading="lazy"
        />
      )
    }

    // ── Relationship ──
    case 'relationship': {
      const { url, alt } = node.value || {}
      if (!url) return null
      return (
        <figure key={key} className="my-6">
          <img
            src={url}
            alt={alt || ''}
            className="mx-auto rounded-lg max-w-full h-auto"
            loading="lazy"
          />
        </figure>
      )
    }

    // ── Block node → delegates to converters ──
    case 'block': {
      const blockType = node.fields?.blockType
      const fields = nullToUndefined(node.fields)

      switch (blockType) {
        case 'mediaBlock':
          return (
            <MediaBlock
              key={key}
              className="col-start-1 col-span-3"
              imgClassName="m-0"
              {...fields}
              captionClassName="mx-auto max-w-[48rem]"
              enableGutter={false}
              disableInnerContainer={true}
            />
          )

        case 'code':
          return <CodeBlock key={key} className="col-start-2" {...fields} />

        case 'heading':
          return <HeadingConverter key={key} level={fields.level} anchorId={fields.anchorId} {...fields} />

        case 'paragraph':
          return <ParagraphConverter key={key} content={fields.content} />

        case 'image':
          return <ImageConverter key={key} image={fields.image} caption={fields.caption} alt={fields.alt} />

        case 'quote':
          return <QuoteConverter key={key} {...fields} />

        case 'audio':
          return <AudioConverter key={key} file={fields.file} caption={fields.caption} autoplay={fields.autoplay} />

        case 'video':
          return <VideoConverter key={key} source={fields.source} file={fields.file} url={fields.url} caption={fields.caption} />

        case 'list':
          return (
            <ListConverter
              key={key}
              items={fields.items?.map((item: any) => item?.text ? String(item.text) : '') ?? []}
              ordered={fields.style === 'ordered'}
            />
          )

        case 'html':
          return <HTMLConverter key={key} {...fields} />

        case 'separator':
          return <SeparatorConverter key={key} />

        case 'spacer':
          return <SpacerConverter key={key} height={fields.height} />

        case 'gallery':
          return <GalleryConverter key={key} {...fields} />

        case 'embed':
          return <EmbedConverter key={key} {...fields} />

        case 'columns':
          return <ColumnsConverter key={key} {...fields} />

        case 'group':
          return <GroupConverter key={key} {...fields} />

        case 'details':
          return <DetailsConverter key={key} content={fields.content} {...fields} />

        case 'pullquote':
          return <PullquoteConverter key={key} {...fields} />

        case 'buttons': {
          const mapped = fields.buttons
            ?.filter((b: any) => b)
            .map((b: any) => ({ label: b.text, link: b.url }))
          return <ButtonsConverter key={key} buttons={mapped} align={fields.align} />
        }

        // ── Interactive blocks (need client JS) ──
        case 'quiz-embed':
          return fields.quiz
            ? <LazyQuiz key={key} quiz={typeof fields.quiz === 'string' ? null : JSON.parse(JSON.stringify(fields.quiz))} />
            : <div key={key} className="text-center text-gray-500">No quiz selected</div>

        case 'bar-chart':
          return <LazyBarChart key={key} block={fields} />

        case 'pie-chart':
          return <LazyPieChart key={key} block={fields} />

        case 'map':
          return (
            <LazyMap
              key={key}
              title={fields.title ?? ''}
              description={fields.description}
              mapType={fields.mapType ?? 'dots'}
              csvFile={fields.csvFile ?? null}
              csvData={fields.csvData ?? null}
              showHotspotsOnly={fields.showHotspotsOnly ?? true}
            />
          )

        case 'bird-checklist':
          return (
            <LazyBirdChecklist
              key={key}
              checklist={fields.checklist}
              showMap={fields.showMap ?? true}
              showFullSpeciesList={fields.showFullSpeciesList ?? true}
              disableInnerContainer={fields.disableInnerContainer ?? false}
            />
          )

        default:
          console.warn(`Unknown block type: ${blockType}`)
          return null
      }
    }

    default:
      if (node.children) {
        return <>{node.children.map((c: any, i: number) => renderNode(c, i))}</>
      }
      return null
  }
}

// ── Main component ──
type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichTextServer(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    data,
    ...rest
  } = props

  if (!data?.root?.children) {
    return null
  }

  return (
    <div
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    >
      {data.root.children.map((node: any, i: number) => renderNode(node, i))}
    </div>
  )
}
