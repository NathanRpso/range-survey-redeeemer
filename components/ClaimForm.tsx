'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRedemptionPass } from '@/actions/claim'
import { RANGES } from '@/lib/config'

export function ClaimForm() {
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

      // Both success and alreadyClaimed lead to the pass page
      router.push(`/pass/${result.shortCode}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Full name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1.5">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Smith"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
        />
      </div>

      {/* Contact */}
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email or mobile number <span className="text-red-500">*</span>
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          required
          autoComplete="email tel"
          placeholder="jane@example.com or 9123 4567"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
        />
        <p className="mt-1 text-xs text-slate-500">Used only to prevent duplicate claims.</p>
      </div>

      {/* Range */}
      <div>
        <label htmlFor="range_name" className="block text-sm font-medium text-slate-700 mb-1.5">
          Driving range <span className="text-red-500">*</span>
        </label>
        <select
          id="range_name"
          name="range_name"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition appearance-none"
        >
          <option value="" disabled>Select your range…</option>
          {RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Claim code */}
      <div>
        <label htmlFor="claim_code" className="block text-sm font-medium text-slate-700 mb-1.5">
          Survey claim code <span className="text-red-500">*</span>
        </label>
        <input
          id="claim_code"
          name="claim_code"
          type="text"
          required
          autoCapitalize="characters"
          placeholder="e.g. RANGE26"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono uppercase tracking-widest text-slate-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
        />
        <p className="mt-1 text-xs text-slate-500">Shown on the last screen of the survey.</p>
      </div>

      {/* Survey location (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Where did you complete the survey?{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <div className="space-y-2">
          {[
            { value: 'at_range_before', label: 'At the range — before my session' },
            { value: 'at_range_after', label: 'At the range — after my session' },
            { value: 'away', label: 'Away from the range' },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 cursor-pointer hover:bg-slate-50 transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="survey_location"
                value={value}
                className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
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
        className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Generating your pass…' : 'Generate my free pass →'}
      </button>
    </form>
  )
}
