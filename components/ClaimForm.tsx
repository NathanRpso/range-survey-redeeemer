'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRedemptionPass } from '@/actions/claim'

export function ClaimForm({ ranges }: { ranges: string[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await createRedemptionPass(formData)

      if ('error' in result) {
        setError(result.error)
        return
      }

      router.push(`/pass/${result.shortCode}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Range — first field, explicit chevron makes it clearly a dropdown */}
      <div>
        <label htmlFor="range_name" className="block text-sm font-medium text-slate-700 mb-1.5">
          Driving range <span className="text-brand">*</span>
        </label>
        <div className="relative">
          <select
            id="range_name"
            name="range_name"
            required
            defaultValue=""
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
          >
            <option value="" disabled>Select your range…</option>
            {ranges.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Full name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1.5">
          Full name <span className="text-brand">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Smith"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email address <span className="text-brand">*</span>
        </label>
        <input
          id="contact"
          name="contact"
          type="email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
        />
        <p className="mt-1.5 text-xs text-slate-500">Used only to prevent duplicate claims.</p>
      </div>

      {/* Claim code */}
      <div>
        <label htmlFor="claim_code" className="block text-sm font-medium text-slate-700 mb-1.5">
          Survey claim code <span className="text-brand">*</span>
        </label>
        <input
          id="claim_code"
          name="claim_code"
          type="text"
          required
          autoCapitalize="characters"
          placeholder="Enter claim code"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-mono uppercase tracking-widest text-slate-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
        />
        <p className="mt-1.5 text-xs text-slate-500">Shown on the last screen of the survey.</p>
      </div>

      {/* Survey location (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Where did you complete the survey?{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <div className="space-y-2">
          {[
            { value: 'at_range_before', label: 'At the range, before my session' },
            { value: 'at_range_after', label: 'At the range, after my session' },
            { value: 'away', label: 'Away from the range' },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition has-[:checked]:border-brand has-[:checked]:bg-red-50"
            >
              <input
                type="radio"
                name="survey_location"
                value={value}
                className="h-4 w-4 accent-brand border-slate-300"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Generating your voucher…' : 'Claim my voucher →'}
      </button>
    </form>
  )
}
