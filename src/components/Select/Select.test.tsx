import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select, type SelectOption, type SelectProps } from '.'

const options: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'research', label: 'Research' },
]

const defaultProps = {
  label: 'Team',
  options,
  value: null,
  onChange: () => undefined,
  placeholder: 'Choose a team',
} satisfies SelectProps

function ControlledSelect(props: SelectProps) {
  const [value, setValue] = useState<string | null>(props.value)

  function handleChange(nextValue: string) {
    setValue(nextValue)
    props.onChange(nextValue)
  }

  return <Select {...props} value={value} onChange={handleChange} />
}

function renderControlled(props: SelectProps = defaultProps) {
  return render(<ControlledSelect {...props} />)
}

function getField(trigger: HTMLElement) {
  const field = trigger.closest('[data-size]')

  if (!(field instanceof HTMLDivElement)) {
    throw new Error('Expected the Select trigger to belong to a field container')
  }

  return field
}

function getIdReferences(element: Element, attribute: string) {
  return (element.getAttribute(attribute) ?? '').split(' ').filter(Boolean)
}

describe('Select public rendering and accessibility', () => {
  it('[AC 10, 11, 12, 22] exposes names and placeholder across all sizes', () => {
    render(
      <>
        <Select {...defaultProps} label="Default size" />
        <Select {...defaultProps} label="Small size" size="sm" />
        <Select {...defaultProps} label="Large size" size="lg" />
      </>,
    )

    const defaultTrigger = screen.getByRole('button', {
      name: 'Default size Choose a team',
    })
    const smallTrigger = screen.getByRole('button', {
      name: 'Small size Choose a team',
    })
    const largeTrigger = screen.getByRole('button', {
      name: 'Large size Choose a team',
    })

    expect(getField(defaultTrigger).getAttribute('data-size')).toBe('md')
    expect(getField(smallTrigger).getAttribute('data-size')).toBe('sm')
    expect(getField(largeTrigger).getAttribute('data-size')).toBe('lg')
    expect(screen.queryByRole('option', { name: 'Choose a team' })).toBeNull()
  })

  it('[AC 22] uses ariaLabel when no visible label is present', () => {
    const props = {
      ariaLabel: 'Team',
      options,
      value: null,
      onChange: () => undefined,
      placeholder: 'Choose a team',
    } satisfies SelectProps

    const { container } = render(<Select {...props} />)
    const trigger = screen.getByRole('button', {
      name: 'Team: Choose a team',
    })

    expect(trigger.getAttribute('aria-label')).toBe('Team: Choose a team')
    expect(container.querySelector('label')).toBeNull()
  })

  it('[AC 13, 23, 24] keeps validation consumer-controlled and describes only the current message', () => {
    const helperProps = {
      ...defaultProps,
      helperText: 'Select the team that owns this work.',
    } satisfies SelectProps
    const { rerender } = render(<Select {...helperProps} />)
    let trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })
    const helperId = trigger.getAttribute('aria-describedby')

    expect(helperId).not.toBeNull()
    expect(document.getElementById(helperId ?? '')?.textContent).toBe(
      'Select the team that owns this work.',
    )
    expect(trigger.getAttribute('aria-invalid')).toBeNull()

    rerender(
      <Select
        {...defaultProps}
        helperText="Select the team that owns this work."
        errorMessage="Choose a team to continue."
      />,
    )
    trigger = screen.getByRole('button', { name: 'Team Choose a team' })
    const errorId = trigger.getAttribute('aria-describedby')
    const errorDescription = document.getElementById(errorId ?? '')

    expect(screen.queryByText('Select the team that owns this work.')).toBeNull()
    expect(errorDescription?.textContent).toBe(
      'Error: Choose a team to continue.',
    )
    expect(trigger.getAttribute('aria-invalid')).toBe('true')
    expect(trigger.getAttribute('aria-describedby')).toBe(errorDescription?.id)
    expect(screen.getByText('Error:').getAttribute('aria-hidden')).toBeNull()

    rerender(<Select {...defaultProps} />)
    trigger = screen.getByRole('button', { name: 'Team Choose a team' })

    expect(trigger.getAttribute('aria-invalid')).toBeNull()
    expect(trigger.getAttribute('aria-describedby')).toBeNull()
    expect(document.getElementById(helperId ?? '')).toBeNull()
    expect(errorDescription?.isConnected).toBe(false)
  })

  it('communicates required state together with helper text', () => {
    const { container } = render(
      <Select
        {...defaultProps}
        required
        helperText="Select the team that owns this work."
      />,
    )
    const trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })
    const descriptionIds = getIdReferences(trigger, 'aria-describedby')
    const descriptions = descriptionIds.map(
      (descriptionId) => document.getElementById(descriptionId)?.textContent,
    )

    expect(container.querySelector('label')?.textContent).toBe('Team *')
    expect(descriptionIds).toHaveLength(2)
    expect(descriptions).toEqual([
      'Required',
      'Select the team that owns this work.',
    ])
  })

  it('[AC 5] uses native disabled behavior and cannot open or change value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <>
        <Select {...defaultProps} disabled onChange={onChange} />
        <button type="button">After Select</button>
      </>,
    )
    const trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    }) as HTMLButtonElement
    const after = screen.getByRole('button', { name: 'After Select' })

    expect(trigger.disabled).toBe(true)
    await user.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).not.toHaveBeenCalled()

    await user.tab()
    expect(document.activeElement).toBe(after)
  })
})

describe('Select pointer behavior', () => {
  it('[AC 1-4, 9, 15] opens, selects once, updates, closes, and restores trigger focus', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderControlled({ ...defaultProps, onChange })
    let trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-controls')).toBeNull()

    await user.click(trigger)
    const listbox = screen.getByRole('listbox', { name: 'Team' })
    const research = within(listbox).getByRole('option', { name: 'Research' })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id)
    expect(research.getAttribute('aria-selected')).toBe('false')

    await user.click(research)
    trigger = screen.getByRole('button', { name: 'Team Research' })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('research')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)

    await user.click(trigger)
    const selectedResearch = screen.getByRole('option', { name: 'Research' })

    expect(selectedResearch.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(selectedResearch)
  })

  it('closes on a second trigger activation without changing the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderControlled({ ...defaultProps, onChange })
    const trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })

    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeNull()

    await user.click(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('[AC 20, 29] outside pointer closes without changing value or restoring trigger focus', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <>
        <ControlledSelect {...defaultProps} onChange={onChange} />
        <button type="button">Outside target</button>
      </>,
    )
    const trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })
    const outside = screen.getByRole('button', { name: 'Outside target' })

    await user.click(trigger)
    await user.click(outside)

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(outside)
    expect(trigger.textContent).toContain('Choose a team')
  })
})

describe('Select keyboard and focus behavior', () => {
  it('[AC 6, 7, 9, 15, 17, 18, 25] opens with Enter on the selection, clamps navigation, and confirms', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderControlled({
      ...defaultProps,
      value: 'engineering',
      onChange,
    })
    let trigger = screen.getByRole('button', { name: 'Team Engineering' })

    await user.tab()
    expect(document.activeElement).toBe(trigger)
    await user.keyboard('{Enter}')

    const engineering = screen.getByRole('option', { name: 'Engineering' })
    const research = screen.getByRole('option', { name: 'Research' })

    expect(document.activeElement).toBe(engineering)
    expect(engineering.getAttribute('aria-selected')).toBe('true')

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(research)
    expect(onChange).not.toHaveBeenCalled()
    expect(trigger.textContent).toContain('Engineering')

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(research)
    expect(onChange).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    trigger = screen.getByRole('button', { name: 'Team Research' })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('research')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('[AC 6, 9, 14, 16-18, 26] opens with Space on the first option and confirms with Space', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderControlled({ ...defaultProps, onChange })
    let trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })

    await user.tab()
    await user.keyboard(' ')

    const design = screen.getByRole('option', { name: 'Design' })
    const engineering = screen.getByRole('option', { name: 'Engineering' })

    expect(document.activeElement).toBe(design)
    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(design)
    expect(onChange).not.toHaveBeenCalled()

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(engineering)
    expect(onChange).not.toHaveBeenCalled()

    await user.keyboard(' ')
    trigger = screen.getByRole('button', { name: 'Team Engineering' })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('engineering')
    expect(document.activeElement).toBe(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('[AC 8] Escape closes without changing the value and restores trigger focus', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderControlled({ ...defaultProps, onChange })
    const trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })

    await user.tab()
    await user.keyboard('{Enter}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Escape}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.textContent).toContain('Choose a team')
    expect(document.activeElement).toBe(trigger)
  })

  it('[AC 19, 28] Tab and Shift+Tab close while focus continues naturally', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <>
        <button type="button">Previous target</button>
        <ControlledSelect {...defaultProps} onChange={onChange} />
        <button type="button">Next target</button>
      </>,
    )
    const previous = screen.getByRole('button', { name: 'Previous target' })
    const trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })
    const next = screen.getByRole('button', { name: 'Next target' })

    previous.focus()
    await user.tab()
    expect(document.activeElement).toBe(trigger)
    await user.keyboard('{Enter}')
    await user.tab()

    expect(document.activeElement).toBe(next)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).not.toHaveBeenCalled()

    await user.tab({ shift: true })
    expect(document.activeElement).toBe(trigger)
    await user.keyboard('{Enter}')
    await user.tab({ shift: true })

    expect(document.activeElement).toBe(previous)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('[AC 21, 27] empty options expose the message and keep focus on the trigger', async () => {
    const user = userEvent.setup()

    renderControlled({ ...defaultProps, options: [] })
    const trigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })

    await user.tab()
    await user.keyboard('{Enter}')
    const emptyMessage = screen.getByText('No options available')
    const descriptionIds = getIdReferences(trigger, 'aria-describedby')

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(emptyMessage.id)
    expect(descriptionIds).toContain(emptyMessage.id)
    expect(screen.queryByRole('option')).toBeNull()
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})

describe('Select generated relationships', () => {
  it('uses unique IDs and resolves label, description, listbox, and option references per instance', async () => {
    const user = userEvent.setup()

    render(
      <>
        <Select {...defaultProps} helperText="Choose the owning team." />
        <Select
          {...defaultProps}
          label="Department"
          helperText="Choose the owning department."
        />
      </>,
    )
    const firstTrigger = screen.getByRole('button', {
      name: 'Team Choose a team',
    })
    const secondTrigger = screen.getByRole('button', {
      name: 'Department Choose a team',
    })
    const firstLabelIds = getIdReferences(firstTrigger, 'aria-labelledby')
    const secondLabelIds = getIdReferences(secondTrigger, 'aria-labelledby')
    const firstDescriptionIds = getIdReferences(
      firstTrigger,
      'aria-describedby',
    )
    const secondDescriptionIds = getIdReferences(
      secondTrigger,
      'aria-describedby',
    )

    for (const relationshipId of [
      ...firstLabelIds,
      ...secondLabelIds,
      ...firstDescriptionIds,
      ...secondDescriptionIds,
    ]) {
      expect(document.getElementById(relationshipId)).not.toBeNull()
    }

    expect(firstTrigger.id).not.toBe(secondTrigger.id)
    expect(new Set([...firstLabelIds, ...secondLabelIds]).size).toBe(4)
    expect(
      new Set([...firstDescriptionIds, ...secondDescriptionIds]).size,
    ).toBe(2)

    await user.click(firstTrigger)
    const firstListbox = screen.getByRole('listbox', { name: 'Team' })
    const firstOptionIds = within(firstListbox)
      .getAllByRole('option')
      .map((option) => option.id)

    expect(firstTrigger.getAttribute('aria-controls')).toBe(firstListbox.id)
    await user.keyboard('{Escape}')

    await user.click(secondTrigger)
    const secondListbox = screen.getByRole('listbox', { name: 'Department' })
    const secondOptionIds = within(secondListbox)
      .getAllByRole('option')
      .map((option) => option.id)

    expect(secondTrigger.getAttribute('aria-controls')).toBe(secondListbox.id)
    expect(firstListbox.id).not.toBe(secondListbox.id)
    expect(
      new Set([...firstOptionIds, ...secondOptionIds]).size,
    ).toBe(firstOptionIds.length + secondOptionIds.length)
  })
})
