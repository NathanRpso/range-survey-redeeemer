import Image from 'next/image'
import { ClaimForm } from '@/components/ClaimForm'
import { getRanges } from '@/lib/config'

export const metadata = {
  title: 'Claim Your Voucher - Rapsodo Range',
}

export default function ClaimPage() {
  const ranges = getRanges()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 pb-16">
      <div className="mx-auto max-w-md">

        {/* Branding — wordmark above, logo below */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-black tracking-[0.3em] text-slate-400 uppercase mb-3">
            Rapsodo Range
          </p>
          <div className="flex justify-center mb-5">
            <Image
              src="/rapsodo_r_logo_black.jpg"
              alt="Rapsodo"
              width={56}
              height={56}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Claim your voucher</h1>
          <p className="mt-2.5 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Thanks for completing the survey. Fill in your details to claim your{' '}
            <span className="font-semibold text-slate-700">free bucket of balls</span> voucher.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ClaimForm ranges={ranges} />
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          One voucher per person · Valid for {process.env.EXPIRY_DAYS ?? '14'} days from claim
        </p>

      </div>
    </main>
  )
}
