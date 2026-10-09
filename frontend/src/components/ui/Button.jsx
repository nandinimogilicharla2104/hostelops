const variants = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
}

function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5
        text-sm font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50
        ${variants[variant]}
        ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button