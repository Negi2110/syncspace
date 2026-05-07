export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    disabled
}) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`
                    w-full px-4 py-2.5 rounded-lg
                    bg-slate-800 border text-slate-100
                    placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                    ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-700 hover:border-slate-600'
                    }
                `}
            />
            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}