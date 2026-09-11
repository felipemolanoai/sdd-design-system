import './Select.css'

export interface SelectOption {
  value: string
  label: string
}

export type SelectSize = 'sm' | 'md' | 'lg'

interface SelectBaseProps {
  /**
   * Keep option order, values, and labels stable while the popup is open.
   */
  options: SelectOption[]
  value: string | null
  onChange: (value: string) => void
  placeholder: string
  helperText?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  size?: SelectSize
  id?: string
  className?: string
}

type SelectAccessibleName =
  | {
      label: string
      ariaLabel?: never
    }
  | {
      label?: never
      ariaLabel: string
    }

export type SelectProps = SelectBaseProps & SelectAccessibleName

export function Select({
  options,
  value,
  placeholder,
  helperText,
  errorMessage,
  required = false,
  disabled = false,
  size = 'md',
  id,
  className,
  label,
  ariaLabel,
}: SelectProps) {
  const selectedOption =
    value === null
      ? undefined
      : options.find((option) => option.value === value)
  const hasError = errorMessage !== undefined
  const description = hasError ? errorMessage : helperText
  const rootClassName = ['select-field', className].filter(Boolean).join(' ')

  return (
    <div
      className={rootClassName}
      data-size={size}
      data-open="false"
      data-invalid={hasError ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      data-required={required ? 'true' : 'false'}
      data-has-label={label !== undefined ? 'true' : 'false'}
    >
      {label !== undefined && (
        <label className="select-field__label" htmlFor={id}>
          {label}
          {required && (
            <span className="select-field__required" aria-hidden="true">
              {' *'}
            </span>
          )}
        </label>
      )}

      <button
        id={id}
        type="button"
        className="select-field__trigger"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-invalid={hasError || undefined}
      >
        <span
          className="select-field__value"
          data-placeholder={selectedOption === undefined ? 'true' : 'false'}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <svg
          className="select-field__chevron"
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m5 7.5 5 5 5-5Z" fill="currentColor" />
        </svg>
      </button>

      {description !== undefined && (
        <p
          className="select-field__description"
          data-message={hasError ? 'error' : 'helper'}
        >
          {hasError && (
            <span className="select-field__error-prefix">Error: </span>
          )}
          {description}
        </p>
      )}
    </div>
  )
}
