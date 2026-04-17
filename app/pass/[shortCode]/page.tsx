import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { computePassStatus } from '@/types'
import type { RedemptionPass } from '@/types'
import { APP_URL } from '@/lib/config'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { PrintButton } from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: { shortCode: string }
}

export async function generateMetadata() {
  return { title: 'Your Voucher - Rapsodo Range' }
}

export default async function PassPage({ params }: Props) {
  const supabase = createServerClient()

  const { data: pass } = (await supabase
    .from('redemption_passes')
    .select('*')
    .eq('short_code', params.shortCode.toUpperCase())
    .maybeSingle()) as { data: RedemptionPass | null; error: unknown }

  if (!pass) notFound()

  const status = computePassStatus(pass)

  const redeemUrl = `${APP_URL}/redeem?code=${pass.short_code}`
  const expiresDate = new Date(pass.expires_at).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 pb-16">
      <div className="mx-auto max-w-sm">

        {/* Branding — wordmark above, logo below */}
        <div className="flex flex-col items-center mb-6">
          <p className="text-[11px] font-black tracking-[0.3em] text-slate-500 uppercase mb-3">
            Rapsodo Range
          </p>
          <Image
            src="/rapsodo_r_logo_black.jpg"
            alt="Rapsodo"
            width={48}
            height={48}
            className="rounded-xl"
          />
        </div>

        {/* Pass card */}
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-lg print:shadow-none">

          {/* Header */}
          <div className="bg-slate-900 px-6 pt-6 pb-5">
            <h1 className="text-2xl font-bold text-white leading-tight">
              Free Bucket of Balls
            </h1>
            <p className="mt-1 text-sm text-slate-400">{pass.range_name}</p>
          </div>

          {/* QR code section */}
          <div className="flex flex-col items-center px-6 pt-8 pb-6 border-b border-dashed border-slate-200">
            {status === 'valid' ? (
              <>
                <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                  <QRCodeDisplay value={redeemUrl} size={220} />
                </div>

                <p className="mt-5 text-base font-semibold text-slate-900 text-center leading-snug">
                  Show this screen to staff to redeem
                </p>

                {/* Pass code — de-emphasised but legible for manual entry */}
                <p className="mt-3 font-mono text-base font-semibold tracking-widest text-slate-400">
                  {pass.short_code}
                </p>
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
                    <p className="mt-1 text-sm text-slate-500">This voucher has been used.</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                      <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-amber-700">Voucher expired</p>
                    <p className="mt-1 text-sm text-slate-500">This voucher is no longer valid.</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Pass details */}
          <div className="px-6 py-5 space-y-3">
            <PassDetail label="Name" value={pass.full_name} />
            <PassDetail label="Valid until" value={expiresDate} />
            <PassDetail label="Status">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === 'valid'
                  ? 'bg-green-100 text-green-800'
                  : status === 'redeemed'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  status === 'valid' ? 'bg-green-500' : status === 'redeemed' ? 'bg-slate-400' : 'bg-amber-500'
                }`} />
                {status === 'valid' ? 'Ready to redeem' : status === 'redeemed' ? 'Redeemed' : 'Expired'}
              </span>
            </PassDetail>
          </div>
        </div>

        {/* Instructions + screenshot prompt */}
        {status === 'valid' && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 no-print">
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              Show this screen to staff at{' '}
              <span className="font-semibold">{pass.range_name}</span>.
              They'll scan the QR code and issue your free bucket of balls.
            </p>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm font-semibold text-amber-800">
              <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Save this pass or screenshot it. You'll need it to claim your bucket of balls.
            </p>
          </div>
        )}

        {/* Print */}
        {status === 'valid' && (
          <div className="mt-3 no-print">
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      {children ?? <span className="text-sm font-medium text-slate-900 text-right">{value}</span>}
    </div>
  )
}
