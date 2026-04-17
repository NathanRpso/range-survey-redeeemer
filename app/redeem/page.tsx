import { Suspense } from 'react'
import { RedeemLookup } from '@/components/RedeemLookup'

export const metadata = {
  title: 'Staff — Verify Pass',
}

export default function RedeemPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
            Staff verification
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Redeem a pass</h1>
          <p className="mt-1 text-sm text-slate-600">
            Scan a customer's QR code or enter their pass code manually.
          </p>
        </div>

        {/* Lookup component — wrapped in Suspense for useSearchParams */}
        <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-slate-200" />}>
          <RedeemLookup />
        </Suspense>
      </div>
    </main>
  )
}
