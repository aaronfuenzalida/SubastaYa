export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-brand-950/75 dark:text-white/70">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-md border border-brand-950/15 bg-white px-3 py-2 text-[15px] text-brand-950 outline-none transition placeholder:text-brand-950/35 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 dark:border-white/15 dark:bg-night-soft dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-400 dark:focus:ring-brand-400/20"
      />
    </label>
  )
}

export function TextArea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-brand-950/75 dark:text-white/70">
        {label}
      </span>
      <textarea
        {...props}
        className="w-full resize-y rounded-md border border-brand-950/15 bg-white px-3 py-2 text-[15px] text-brand-950 outline-none transition placeholder:text-brand-950/35 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 dark:border-white/15 dark:bg-night-soft dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-400 dark:focus:ring-brand-400/20"
      />
    </label>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-[13px] font-medium text-brand-950/75 dark:text-white/70">
          {label}
        </span>
      )}
      <select
        {...props}
        className="w-full rounded-md border border-brand-950/15 bg-white px-3 py-2 text-sm text-brand-950 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 dark:border-white/15 dark:bg-night-soft dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400/20"
      >
        {children}
      </select>
    </label>
  )
}

export function Spinner({ className = 'size-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  )
}

export function PrimaryButton({ loading, children, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400 ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
