import { useEffect, useId, useRef, useState } from 'react'
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
  onChange,
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
  const generatedId = useId()
  const idBase = id ?? generatedId
  const triggerId = id ?? `${idBase}-trigger`
  const labelId = `${idBase}-label`
  const listboxId = `${idBase}-listbox`
  const helperId = `${idBase}-helper`
  const errorId = `${idBase}-error`
  const optionIdPrefix = `${idBase}-option`
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedOption =
    value === null
      ? undefined
      : options.find((option) => option.value === value)
  const hasError = errorMessage !== undefined
  const description = hasError ? errorMessage : helperText
  const descriptionId = hasError ? errorId : helperId
  const rootClassName = ['select-field', className].filter(Boolean).join(' ')

  function open() {
    if (disabled) {
      return
    }

    const selectedIndex = options.findIndex((option) => option.value === value)
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : options.length > 0 ? 0 : -1,
    )
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function commitSelection(index: number) {
    const option = options[index]

    if (disabled || option === undefined) {
      return
    }

    onChange(option.value)
    close()
    triggerRef.current?.focus()
  }

  // Tasks 5 and 6 attach these shared transitions to keyboard and pointer events.
  void open
  void commitSelection

  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return
    }

    optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, isOpen])

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      data-size={size}
      data-open={isOpen ? 'true' : 'false'}
      data-invalid={hasError ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      data-required={required ? 'true' : 'false'}
      data-has-label={label !== undefined ? 'true' : 'false'}
    >
      {label !== undefined && (
        <label
          id={labelId}
          className="select-field__label"
          htmlFor={triggerId}
        >
          {label}
          {required && (
            <span className="select-field__required" aria-hidden="true">
              {' *'}
            </span>
          )}
        </label>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="select-field__trigger"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen && options.length > 0 ? listboxId : undefined}
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

      {isOpen && (
        <div className="select-field__popup">
          {options.length > 0 ? (
            <div
              id={listboxId}
              className="select-field__listbox"
              role="listbox"
            >
              {options.map((option, index) => (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element
                  }}
                  id={`${optionIdPrefix}-${index}`}
                  type="button"
                  className="select-field__option"
                  role="option"
                  aria-selected={option.value === value}
                  tabIndex={index === activeIndex ? 0 : -1}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="select-field__empty">No options available</div>
          )}
        </div>
      )}

      {description !== undefined && (
        <p
          id={descriptionId}
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
