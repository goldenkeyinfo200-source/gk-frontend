import { X, Loader2 } from 'lucide-react'
import clsx from 'clsx'

// ─── Button ─────────────────────────────────────────────
export function Btn({ variant = 'primary', size = 'md', loading, children, className, ...p }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-cherry-700 hover:bg-cherry-800 text-white rounded-xl',
    outline: 'bg-white hover:bg-cherry-50 text-cherry-700 border border-cherry-200 rounded-xl',
    ghost:   'text-gray-600 hover:bg-cherry-50 hover:text-cherry-700 rounded-xl',
    danger:  'bg-red-600 hover:bg-red-700 text-white rounded-xl',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' }
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={loading} {...p}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : children}
    </button>
  )
}

// ─── Input ──────────────────────────────────────────────
export function Input({ label, error, icon: Icon, className, ...p }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          className={clsx(
            'w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all',
            Icon && 'pl-9',
            error ? 'border-red-400' : 'border-cherry-100',
            className
          )}
          {...p}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Select ─────────────────────────────────────────────
export function Select({ label, error, children, className, ...p }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <select
        className={clsx(
          'w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-900',
          'focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all',
          error ? 'border-red-400' : 'border-cherry-100',
          className
        )}
        {...p}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Textarea ───────────────────────────────────────────
export function Textarea({ label, error, className, ...p }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <textarea
        rows={3}
        className={clsx(
          'w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 resize-none',
          'focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all',
          error ? 'border-red-400' : 'border-cherry-100',
          className
        )}
        {...p}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Modal ──────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-modal', sizes[size], 'max-h-[92vh] overflow-y-auto')}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-cherry-50 sticky top-0 bg-white rounded-t-3xl z-10">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-cherry-50 text-gray-400 hover:text-cherry-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Badge ──────────────────────────────────────────────
export function Badge({ color = 'gray', children, className }) {
  const colors = {
    green:  'bg-green-50 text-green-700',
    red:    'bg-cherry-50 text-cherry-700',
    amber:  'bg-amber-50 text-amber-700',
    blue:   'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    gray:   'bg-gray-100 text-gray-600',
    gold:   'bg-amber-50 text-amber-700',
  }
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md', colors[color], className)}>
      {children}
    </span>
  )
}

// ─── Empty ──────────────────────────────────────────────
export function Empty({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && <div className="w-14 h-14 bg-cherry-50 rounded-2xl flex items-center justify-center mb-4"><Icon size={24} className="text-cherry-400" /></div>}
      <p className="font-medium text-gray-800 mb-1">{title}</p>
      {desc && <p className="text-sm text-gray-500 mb-4">{desc}</p>}
      {action}
    </div>
  )
}

// ─── Spinner ────────────────────────────────────────────
export function Spinner({ className }) {
  return <Loader2 size={20} className={clsx('animate-spin text-cherry-600', className)} />
}

// ─── Toggle ─────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={clsx('w-10 h-5 rounded-full transition-colors', checked ? 'bg-cherry-600' : 'bg-gray-200')} />
        <div className={clsx('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', checked && 'translate-x-5')} />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
}

// ─── Stat Card ──────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, color = 'cherry' }) {
  const colors = {
    cherry: 'bg-cherry-50 text-cherry-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    blue:   'bg-blue-50 text-blue-600',
  }
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', colors[color])}>
          <Icon size={17} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">{sub}</p>}
    </div>
  )
}
