// RichText index.tsx
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  SerializedTableNode,       
  SerializedTableRowNode,    
  SerializedTableCellNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import type {
  MediaBlock as MediaBlockProps,
  HeadingBlock as HeadingBlockProps,
  ParagraphBlock as ParagraphBlockProps,
  ImageBlock as ImageBlockProps,
  QuoteBlock as QuoteBlockProps,
  AudioBlock as AudioBlockProps,
  VideoBlock as VideoBlockProps,
  ListBlock as ListBlockProps,
  HTMLBlock as HTMLBlockProps,
  SeparatorBlock as SeparatorBlockProps,
  SpacerBlock as SpacerBlockProps,
  GalleryBlock as GalleryBlockProps,
  EmbedBlock as EmbedBlockProps,
  ColumnsBlock as ColumnsBlockProps,
  GroupBlock as GroupBlockProps,
  DetailsBlock as DetailsBlockProps,
  PullquoteBlock as PullquoteBlockProps,
  ButtonsBlock as ButtonsBlockProps,
} from '@/payload-types'
import type { Quiz } from '@/payload-types'
import { cn } from '@/utilities/ui'

// ---------------------------------------------------------------------------
// Import lazily-loaded heavy blocks from client-only file
// ---------------------------------------------------------------------------
import {
  LazyQuiz,
  LazyBarChart,
  LazyPieChart,
  LazyMap,
} from './LazyBlocks.client'
import BirdChecklistWrapper from '@/blocks/BirdChecklist/ChecklistWrapper'

// Lightweight converters are imported normally (small, used often)
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


// Define locally since it's not exported from payload-types
type QuizBlockProps = {
  quiz: Quiz
}

type MapBlockProps = {
  title?: string
  description?: string | null
  mapType?: 'dots' | 'heatmap'
  csvFile?: { url: string } | null
  csvData?: string | null
  showHotspotsOnly?: boolean
}

type BirdChecklistBlockProps = {
  checklist: { id: string } | string
  showMap?: boolean
  showFullSpeciesList?: boolean
  disableInnerContainer?: boolean
}

type BarChartBlockProps = {
  title?: string
  description?: string
  caption?: string
  chartData?: { label: string; value1: number; value2?: number }[]
  series1Label?: string
  series1Color?: string
  series2Label?: string
  series2Color?: string
}

type PieChartBlockProps = {
  title?: string
  description?: string
  chartData?: { label: string; value: number; color?: string }[]
}

type NodeTypes =
  | DefaultNodeTypes
  | SerializedTableNode
  | SerializedTableRowNode
  | SerializedTableCellNode
  | SerializedBlockNode<
      | MediaBlockProps
      | CodeBlockProps
      | HeadingBlockProps
      | ParagraphBlockProps
      | ImageBlockProps
      | QuoteBlockProps
      | AudioBlockProps
      | VideoBlockProps
      | ListBlockProps
      | HTMLBlockProps
      | SeparatorBlockProps
      | SpacerBlockProps
      | GalleryBlockProps
      | EmbedBlockProps
      | ColumnsBlockProps
      | QuizBlockProps
      | GroupBlockProps
      | DetailsBlockProps
      | PullquoteBlockProps
      | ButtonsBlockProps
      | BarChartBlockProps
      | PieChartBlockProps
      | MapBlockProps
      | BirdChecklistBlockProps
    >

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

// Helper: recursively replaces null with undefined throughout an object
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
const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...nullToUndefined(node.fields)}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => (
      <CodeBlock className="col-start-2" {...nullToUndefined(node.fields)} />
    ),
    heading: ({ node }) => {
      const { level, anchorId, ...rest } = nullToUndefined(node.fields)
      return <HeadingConverter {...rest} level={level} anchorId={anchorId} />
    },
    paragraph: ({ node }) => (
      <ParagraphConverter content={node.fields.content} />
    ),
    image: ({ node }) => {
      const { image, caption, alt } = nullToUndefined(node.fields)
      return <ImageConverter image={image} caption={caption} alt={alt} />
    },
    quote: ({ node }) => <QuoteConverter {...nullToUndefined(node.fields)} />,
    audio: ({ node }) => {
      const { file, caption, autoplay } = nullToUndefined(node.fields)
      return <AudioConverter file={file} caption={caption} autoplay={autoplay} />
    },
    video: ({ node }) => {
      const { source, file, url, caption } = nullToUndefined(node.fields)
      return (
        <VideoConverter source={source} file={file} url={url} caption={caption} />
      )
    },
    list: ({ node }) => {
      const { style, items } = node.fields
      return (
        <ListConverter
          items={items?.map((item) => JSON.stringify(item.text)) ?? undefined}
          ordered={style === 'ordered'}
        />
      )
    },
    html: ({ node }) => <HTMLConverter {...nullToUndefined(node.fields)} />,
    separator: () => <SeparatorConverter />,
    spacer: ({ node }) => {
      const { height } = nullToUndefined(node.fields)
      return <SpacerConverter height={height} />
    },
    gallery: ({ node }) => (
      <GalleryConverter {...nullToUndefined(node.fields)} />
    ),
    embed: ({ node }) => <EmbedConverter {...nullToUndefined(node.fields)} />,
    columns: ({ node }) => (
      <ColumnsConverter {...nullToUndefined(node.fields)} />
    ),
    'quiz-embed': ({ node }: { node: SerializedBlockNode<QuizBlockProps> }) => {
      const quiz = node.fields.quiz
      if (!quiz) {
        return <div className="text-center text-gray-500">No quiz selected</div>
      }
      if (typeof quiz === 'string') {
        return <div className="text-center text-red-500">Quiz not loaded properly (ID: {quiz})</div>
      }
      const serialized = JSON.parse(JSON.stringify(quiz))
      return <LazyQuiz quiz={serialized} />
    },
    group: ({ node }) => <GroupConverter {...nullToUndefined(node.fields)} />,
    details: ({ node }) => {
      const { content, ...rest } = nullToUndefined(node.fields)
      return <DetailsConverter {...rest} content={content} />
    },
    pullquote: ({ node }) => (
      <PullquoteConverter {...nullToUndefined(node.fields)} />
    ),
    buttons: ({ node }) => {
      const { buttons, align } = node.fields
      const mappedButtons = buttons
        ?.filter((b): b is { text: string; url: string } => !!b)
        .map((b) => ({
          label: b.text,
          link: b.url,
        }))
      return <ButtonsConverter buttons={mappedButtons} align={align ?? undefined} />
    },
    'bar-chart': ({ node }: { node: SerializedBlockNode<BarChartBlockProps> }) => (
      <LazyBarChart block={nullToUndefined(node.fields)} />
    ),
    'pie-chart': ({ node }: { node: SerializedBlockNode<PieChartBlockProps> }) => (
      <LazyPieChart block={nullToUndefined(node.fields)} />
    ),
    map: ({ node }: { node: SerializedBlockNode<MapBlockProps> }) => (
      <LazyMap
        title={node.fields.title ?? ''}
        description={node.fields.description}
        mapType={node.fields.mapType ?? 'dots'}
        csvFile={node.fields.csvFile ?? null}
        csvData={node.fields.csvData ?? null}
        showHotspotsOnly={node.fields.showHotspotsOnly ?? true}
      />
    ),
'bird-checklist': ({ node }: { node: 
SerializedBlockNode<BirdChecklistBlockProps> }) => (
  <BirdChecklistWrapper
    block={nullToUndefined(node.fields)}
  />
),
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
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
    />
  )
}
