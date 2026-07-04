'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  author: z.string().min(1, 'Name is required').max(100),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')]),
  content: z.string().min(1, 'Comment is required').max(5000),
  fax_number: z.string().max(0), // honeypot — must be empty
})

type FormValues = z.infer<typeof formSchema>

interface AddCommentFormProps {
  replyPost: string
  replyComment?: string | null
  replyAuthor?: string | null
  replyContent?: string | null
  onSuccess?: () => void
  onCancelReply?: () => void
}

export default function AddCommentForm({
  replyPost,
  replyComment = null,
  replyAuthor = null,
  replyContent = null,
  onSuccess,
  onCancelReply,
}: AddCommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const form = useForm<FormValues>({
    defaultValues: {
      author: '',
      email: '',
      content: '',
      fax_number: '',
    },
  })

  async function onSubmit(values: FormValues) {
    // Manual validation instead of zodResolver
    const result = formSchema.safeParse(values)
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        errors[issue.path[0] as string] = issue.message
      }
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const body: Record<string, unknown> = {
        author: values.author,
        email: values.email,
        content: values.content,
        replyPost: replyPost,
      }

      if (replyComment) {
        body.replyComment = replyComment
      }

      const res = await fetch('/api/comments/add-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!data.saved) {
        setSubmitError(data.error || 'Something went wrong.')
        return
      }

      setSubmitSuccess(true)
      form.reset()
      onSuccess?.()
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="border-2 border-black p-8 bg-[oklch(92%_0.10_145)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] my-8 dark:text-black">
        <p className="text-base font-semibold mb-4">
          {replyAuthor
            ? `Your reply to ${replyAuthor} has been submitted and is awaiting approval.`
            : 'Your comment has been submitted and is awaiting approval.'}
        </p>
        <Button type="button" onClick={() => setSubmitSuccess(false)}>
          Add another comment
        </Button>
      </div>
    )
  }

  return (
    <div className="border-2 border-black p-8 bg-[oklch(96.79%_0.0654_102.26)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] my-8 dark:text-black">
      <h3 className="text-2xl font-bold uppercase tracking-tighter font-['Courier_New',monospace] mt-0 mb-2">
        {replyAuthor ? (
          <>Replying to <em>{replyAuthor}</em></>
        ) : (
          'Leave a comment'
        )}
      </h3>

      {replyAuthor && onCancelReply && (
        <button
          type="button"
          onClick={onCancelReply}
          className="bg-transparent border-2 border-black px-3 py-1 text-xs cursor-pointer mb-4 font-['Courier_New',monospace] uppercase font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 dark:text-black"
        >
          Cancel reply
        </button>
      )}

      {/* Quoted comment being replied to */}
      {replyAuthor && replyContent && (
        <div className="border-l-4 border-black pl-4 py-2 mb-6 bg-[oklch(94%_0.04_90)] text-sm italic text-gray-600 dark:text-gray-800">
          <span className="not-italic font-semibold text-black">{replyAuthor} wrote:</span>
          <p
            className="mt-1 mb-0 [&_a]:underline [&_a]:text-blue-700"
            dangerouslySetInnerHTML={{ __html: replyContent }}
          />
        </div>
      )}

      {submitError && (
        <p className="text-red-600 font-semibold border-2 border-red-600 p-3 mb-4 bg-red-50">
          {submitError}
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Honeypot — hidden from users, bots fill it */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <FormField
              control={form.control}
              name="fax_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-black">Fax Number</FormLabel>
                  <FormControl>
                    <Input tabIndex={-1} autoComplete="off" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-black">Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} className="dark:bg-white dark:text-black" />
                </FormControl>
                {fieldErrors.author && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.author}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-black">Email (optional, include if you want to be notified of a reply)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} className="dark:bg-white dark:text-black" />
                </FormControl>
                {fieldErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-black">Comment *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your comment…"
                    className="min-h-[120px] resize-y dark:bg-white dark:text-black"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                {fieldErrors.content && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.content}</p>
                )}
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? 'Submitting…' : replyAuthor ? 'Post reply' : 'Post comment'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
