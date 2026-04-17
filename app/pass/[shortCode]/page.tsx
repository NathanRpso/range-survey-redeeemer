import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { computePassStatus } from '@/types'
import { APP_URL } from '@/lib/config'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { CopyButton } from '@/components/CopyButton'
import { PrintButton } from '@/components/PrintButton'

interface Props {
  params: { shortCode: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: `Pass ${params.shortCode}` }
}

export default async function PassPage({ params }: Props) {
  const supabase = createServerClient()

  const { data: pass } = await supabase
    .from('redemption_passes')
    .select('*')
    .eq('short_code', params.shortCode.toUpperCase())
    .maybeSingle()

  if (!pass) notFound()

  const status = computePassStatus(pass)

  const redeemUrl = `${APP_URL}/redeem?code=${pass.short_code}`
  const expiresDate = new Date(pass.expires_at).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const claimedDate = new Date(pass.created_at).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-sm">

        {/* Pass card */}
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-lg print:shadow-none print:border-slate-300">

          {/* Header */}
          <div className="bg-emerald-600 px-6 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
              Driving Range Survey
            </p>
            <h1 className="mt-1 text-xl font-bold leading-tight">
              Free Bucket of Balls
            </h1>
            <p className="mt-0.5 text-sm text-emerald-100">{pass.range_name}</p>
          </div>

          {/* QR + code */}
          <div className="flex flex-col items-center px-6 py-7 border-b border-dashed border-slate-200">
            {status === 'valid' ? (
              <>
                <div className="rounded-2xl border border-slate-100 p-2 shadow-sm">
                  <QRCodeDisplay value={redeemUrl} size={180} />
                </div>
                <p className="mt-4 text-xs text-slate-500">Scan or show to range staff</p>

                {/* Short code */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="rounded-xl bg-slate-100 px-4 py-2 font-mono text-xl font-bold tracking-widest text-slate-900">
                    {pass.short_code}
                  </span>
                  <CopyButton text={pass.short_code} label="Copy code" />
                </div>
                <p className="mt-2 text-xs text-slate-400">Manual entry fallback</p>
              </>
            ) : (
              <div className="py-8 text-center">
                {status === 'redeemed' ? (
                  <>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-slate-700">Already redeemed</p>
                    <p className="mt-1 text-sm text-slate-500">This pass has been used.</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                      <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-amber-700">Pass expired</p>
                    <p className="mt-1 text-sm text-slate-500">This pass is no longer valid.</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-2.5">
            <PassDetail label="Name" value={pass.full_name} />
            <PassDetail label="Claimed" value={claimedDate} />
            <PassDetail label="Valid until" value={expiresDate} />
            <PassDetail label="Status">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === 'valid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'redeemed'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  status === 'valid' ? 'bg-emerald-500' : status === 'redeemed' ? 'bg-slate-400' : 'bg-amber-500'
                }`} />
                {status === 'valid' ? 'Ready to redeem' : status === 'redeemed' ? 'Redeemed' : 'Expired'}
              </span>
            </PassDetail>
          </div>
        </div>

        {/* Instructions */}
        {status === 'valid' && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 no-print">
            <p className="text-sm font-semibold text-slate-800 mb-2">How to redeem</p>
            <ol className="space-y-1.5 text-sm text-slate-600 list-decimal list-inside">
              <li>Show this screen to a staff member at {pass.range_name}.</li>
              <li>They'll scan the QR code or enter the code <span className="font-mono font-semibold">{pass.short_code}</span>.</li>
              <li>Collect your free bucket of balls. Enjoy!</li>
            </ol>
          </div>
        )}

        {/* Print button */}
        {status === 'valid' && (
          <div className="mt-4 no-print">
            <PrintButton />
          </div>
        )}
      </div>
    </main>
  )
}

function PassDetail({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      {children ?? <span className="text-sm font-medium text-slate-900">{value}</span>}
    </div>
  )
}
