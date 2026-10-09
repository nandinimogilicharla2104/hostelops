function Input({
  label,
  error,
  className = "",
  id,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5
          text-sm text-slate-900 outline-none transition
          placeholder:text-slate-400
          focus:border-slate-500 focus:ring-2 focus:ring-slate-200
          disabled:bg-slate-100 disabled:text-slate-500
          ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}
          ${className}`}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input