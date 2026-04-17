'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
    >
      Print this pass
    </button>
  )
}
