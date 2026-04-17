'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
    >
      Print this pass
    </button>
  )
}
