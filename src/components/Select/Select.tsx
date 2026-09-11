import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'
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

  function restoreTriggerFocus() {
    triggerRef.current?.focus()
  }

  function handleTriggerClick() {
    if (disabled) {
      return
    }

    if (isOpen) {
      close()
    } else {
      open()
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()

      if (!isOpen) {
        open()
      }

      return
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      close()
      restoreTriggerFocus()
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (disabled || !isOpen) {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex(Math.min(index + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex(Math.max(index - 1, 0))
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commitSelection(index)
        break
      case 'Escape':
        event.preventDefault()
        close()
        restoreTriggerFocus()
        break
    }
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    if (!isOpen) {
      return
    }

    const nextFocusedElement = event.relatedTarget

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return
    }

    close()
  }

  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return
    }

    optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleDocumentPointerDown(event: PointerEvent) {
      const root = rootRef.current
      const target = event.target

      if (root === null || !(target instanceof Node) || root.contains(target)) {
        return
      }

      close()
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  }, [isOpen])

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      onBlur={handleRootBlur}
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
        tabIndex={isOpen && activeIndex >= 0 ? -1 : 0}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
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
                  onClick={() => commitSelection(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
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
