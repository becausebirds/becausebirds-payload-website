'use client'

import { useState, useRef } from 'react'
import AddCommentForm from './AddCommentForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Comment {
  id: string
  author: string
  content: string
  date: string
  isApproved: boolean
  replyComment?: string | { id: string } | null
}

interface BlogCommentsProps {
  comments: Comment[]
  postId: string
}

const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase()
}
const AUTHOR_NAME = 'Jeff Mann'
const AUTHOR_IMAGE = '/jeff_mann.jpg'

export default function BlogComments({ comments, postId }: BlogCommentsProps) {
  const [replyTo, setReplyTo] = useState<{
    id: string
    author: string
    content: string
  } | null>(null)

  const formRef = useRef<HTMLDivElement>(null)

  const handleReply = (comment: Comment) => {
    setReplyTo({ id: comment.id, author: comment.author, content: comment.content })
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const approvedComments = comments.filter(comment => comment.isApproved)

  // Build a map of commentId -> replies
  const repliesByParent: Record<string, Comment[]> = {}
  for (const comment of approvedComments) {
    if (!comment.replyComment) continue
    const parentId = typeof comment.replyComment === 'object'
      ? comment.replyComment.id
      : comment.replyComment
    if (!repliesByParent[parentId!]) {
      repliesByParent[parentId!] = []
    }
    repliesByParent[parentId!].push(comment)
  }

  const topLevelComments = approvedComments.filter(c => !c.replyComment)

  // Recursive render function — handles any level of nesting
  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id}>
      <div
        className={`border-2 border-black p-6 bg-[oklch(96.79%_0.0654_102.26)]
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px]
hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
transition-all duration-200 dark:text-black${
          depth > 0
            ? ` bg-[oklch(94%_0.04_90)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
hover:translate-x-[-1px] hover:translate-y-[-1px]
hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
            : ''
        }`}
        style={{ marginLeft: depth * 2 + 'rem' }}
      >
        <div className="flex gap-4 mb-4 items-start">

{comment.author === AUTHOR_NAME ? (
  <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden
shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <img
      src={AUTHOR_IMAGE}
      alt={comment.author}
      className="w-full h-full object-cover"
    />
  </div>
) : (
  <div className="w-12 h-12 rounded-full border-2 border-black flex
items-center justify-center font-bold text-xl shrink-0
bg-[oklch(96.79%_0.0654_102.26)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
dark:text-black">
    {getInitial(comment.author)}
  </div>
)}

          <div className="flex-1">
<h3 className="text-base font-bold mt-0 mb-0">
  {comment.author}
  {comment.author === AUTHOR_NAME && (
  <Badge className="mx-2 dark:text-black">
      Author
    </Badge>
  )}
</h3>

            <p className="text-sm text-gray-500 mt-1 mb-0
font-['Courier_New',monospace] dark:text-gray-700">
              {new Date(comment.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <p
          className="text-base leading-relaxed mt-0 text-gray-700 dark:text-
gray-900"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => handleReply(comment)}
          className="mt-3"
        >
          ↳ Reply
        </Button>
      </div>

      {/* Recursively render replies to THIS comment at any depth */}
      {repliesByParent[comment.id]?.map((reply) =>
        renderComment(reply, depth + 1)
      )}
    </div>
  )

  return (
    <section className="my-16 py-8 border-t-2 border-b-2 border-black">
      <h2 className="text-[1.75rem] font-bold mb-8 uppercase tracking-tighter
font-['Courier_New',monospace]">
        Comments from the community
      </h2>

      <div ref={formRef}>
        <AddCommentForm
          replyPost={String(postId).trim()}
          replyComment={replyTo?.id ?? null}
          replyAuthor={replyTo?.author ?? null}
          replyContent={replyTo?.content ?? null}
          onCancelReply={() => setReplyTo(null)}
          onSuccess={() => setReplyTo(null)}
        />
      </div>

      {approvedComments.length === 0 ? (
        <p className="text-base text-gray-500 italic dark:text-gray-400">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="flex flex-col gap-6 mt-8">
          {topLevelComments.map((comment) =>
            renderComment(comment, 0)
          )}
        </div>
      )}
    </section>
  )
}
