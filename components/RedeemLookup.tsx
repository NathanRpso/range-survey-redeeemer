'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { lookupPass, markAsRedeemed } from '@/actions/redeem'
import type { PassWithStatus } from '@/actions/redeem'

type ViewState = 'idle' | 'loading' | 'found' | 'not_found' | 'redeemed_success' | 'error'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', { dateStyle: 'medium' })
}

export function RedeemLookup() {
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [pass, setPass] = useState<PassWithStatus | null>(null)
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const hasAutoLookedUp = useRef(false)

  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode && !hasAutoLookedUp.current) {
      hasAutoLookedUp.current = true
      setCode(urlCode)
      doLookup(urlCode)
    }
  }, [searchParams])

  function doLookup(lookupCode: string) {
    const normalised = lookupCode.trim().toUpperCase()
    if (!normalised) return

    setViewState('loading')
    setPass(null)
    setErrorMsg('')

    startTransition(async () => {
      const result = await lookupPass(normalised)

      if ('error' in result) {
        setViewState('not_found')
        setErrorMsg(result.error)
      } else {
        setPass(result.pass)
        setViewState('found')
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doLookup(code)
  }

  function handleRedeem() {
    if (!pass) return

    startTransition(async () => {
      const result = await markAsRedeemed(pass.short_code)

      if ('success' in result) {
        setViewState('redeemed_success')
        setPass({ ...pass, redeemed: true, computedStatus: 'redeemed' })
      } else {
        setErrorMsg(result.error)
        setViewState('error')
      }
    })
  }

const isLoading = isPending

  return (
    <div className="space-y-6">
      {/* Code input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          type="text"
          placeholder="RG-XXXX"
          autoCapitalize="characters"
          maxLength={7}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-mono text-lg uppercase tracking-widest text-slate-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? '…' : 'Look up'}
        </button>
      </form>

      {/* States */}
      {viewState === 'not_found' && (
        <StatusCard variant="error" title="Voucher not found" message={errorMsg} />
      )}

      {viewState === 'error' && (
        <StatusCard variant="error" title="Error" message={errorMsg} />
      )}

      {(viewState === 'found' || viewState === 'redeemed_success') && pass && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Status banner */}
          <div className={`px-5 py-3 ${
            pass.computedStatus === 'valid'
              ? 'bg-green-600'
              : pass.computedStatus === 'redeemed'
              ? 'bg-slate-700'
              : 'bg-amber-500'
          }`}>
            <p className="text-sm font-semibold text-white tracking-wide uppercase">
              {pass.computedStatus === 'valid' && '✓ Valid — ready to redeem'}
              {pass.computedStatus === 'redeemed' && '✗ Already redeemed'}
              {pass.computedStatus === 'expired' && '⚠ Expired'}
            </p>
          </div>

          {/* Voucher details */}
          <div className="px-5 py-5 space-y-3">
            <DetailRow label="Name" value={pass.full_name} />
            <DetailRow label="Range" value={pass.range_name} />
            <DetailRow label="Code" value={pass.short_code} mono />
            <DetailRow label="Created" value={formatDate(pass.created_at)} />
            {pass.redeemed && pass.redeemed_at
              ? <DetailRow label="Redeemed" value={formatDate(pass.redeemed_at)} />
              : <DetailRow label="Expires" value={formatDateShort(pass.expires_at)} />
            }
          </div>

          {/* Action area */}
          {viewState === 'found' && pass.computedStatus === 'valid' && (
            <div className="border-t border-slate-100 px-5 py-4">
              <button
                onClick={handleRedeem}
                disabled={isLoading}
                className="w-full rounded-xl bg-green-600 px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? 'Redeeming…' : 'Mark as Redeemed'}
              </button>
            </div>
          )}

          {viewState === 'redeemed_success' && (
            <div className="border-t border-slate-100 px-5 py-4">
              <p className="text-center text-sm font-semibold text-slate-700">
                ✓ Voucher successfully redeemed
              </p>
            </div>
          )}

          {pass.computedStatus === 'redeemed' && viewState !== 'redeemed_success' && (
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-center text-sm text-slate-500">
                This voucher has already been used.
              </p>
            </div>
          )}

          {pass.computedStatus === 'expired' && (
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-center text-sm text-amber-700 font-medium">
                This voucher expired on {formatDateShort(pass.expires_at)}.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-slate-900 text-right ${mono ? 'font-mono tracking-wider' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function StatusCard({
  variant,
  title,
  message,
}: {
  variant: 'error' | 'warning'
  title: string
  message: string
}) {
  const colors =
    variant === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div className={`rounded-2xl border px-5 py-4 ${colors}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-0.5 text-sm opacity-80">{message}</p>
    </div>
  )
}
