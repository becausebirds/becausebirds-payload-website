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
  name: z.string().min(1, 'Name is required').max(100),
  location: z.string().max(200).optional().default(''),
  favoriteBird: z.string().min(1, 'Favorite bird is required').max(200),
  message: z.string().max(5000).optional().default(''),
  website: z.string().max(0), // honeypot — must be empty
})

type FormValues = z.infer<typeof formSchema>

interface SignGuestBookFormProps {
  onSuccess?: () => void
}

export default function SignGuestBookForm({ onSuccess }: SignGuestBookFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      location: '',
      favoriteBird: '',
      message: '',
      website: '',
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
      const body = {
        name: values.name,
        location: values.location,
        favoriteBird: values.favoriteBird,
        message: values.message || '',
      }

      const res = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.errors?.[0]?.message || 'Something went wrong.')
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
      <div className="border-2 border-black dark:border-border p-8 bg-[oklch(92%_0.10_145)] dark:bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] my-8 dark:text-foreground">
        <p className="text-base font-semibold mb-4">
          Thanks for signing the guest book! Your entry will appear momentarily.
        </p>
        <Button type="button" onClick={() => setSubmitSuccess(false)}>
          Sign again
        </Button>
      </div>
    )
  }

  return (
    <div className="border-2 border-black dark:border-border p-8 bg-[oklch(96.79%_0.0654_102.26)] dark:bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_hsl(var(--border))] my-8 dark:text-foreground">
      <h3 className="text-2xl font-bold uppercase tracking-tighter font-['Courier_New',monospace] mt-0 mb-2">
        Add your favorite bird to the guest book ✒️
      </h3>

      {submitError && (
        <p className="text-red-600 dark:text-red-400 font-semibold border-2 border-red-600 dark:border-red-400 p-3 mb-4 bg-red-50 dark:bg-red-950">
          {submitError}
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Honeypot — hidden from users, bots fill it */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input tabIndex={-1} autoComplete="off" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="favoriteBird"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Favorite bird</FormLabel>
                <FormControl>
                  <Input placeholder="Write the best bird here" {...field} className="dark:bg-input dark:text-foreground" />
                </FormControl>
                {fieldErrors.favoriteBird && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{fieldErrors.favoriteBird}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a message"
                    className="min-h-[120px] resize-y dark:bg-input dark:text-foreground"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                {fieldErrors.message && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{fieldErrors.message}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} className="dark:bg-input dark:text-foreground" />
                </FormControl>
                {fieldErrors.name && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{fieldErrors.name}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="The forest" {...field} className="dark:bg-input dark:text-foreground" />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? 'Submitting…' : 'Sign guest book'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
