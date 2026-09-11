import { useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Select, type SelectOption, type SelectProps } from '.'

const options: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'research', label: 'Research' },
]

const manyOptions = Array.from({ length: 50 }, (_, index) => ({
  value: `option-${index + 1}`,
  label: `Option ${index + 1}`,
}))

const emptyOptions: SelectOption[] = []

const storyFrameStyles: CSSProperties = {
  inlineSize: 'min(22rem, calc(100vw - 2rem))',
}

const interactionFrameStyles: CSSProperties = {
  display: 'grid',
  gap: '1rem',
  inlineSize: 'min(28rem, calc(100vw - 2rem))',
}

function ControlledSelect(props: SelectProps) {
  const [value, setValue] = useState<string | null>(props.value)

  function handleChange(nextValue: string) {
    setValue(nextValue)
    props.onChange(nextValue)
  }

  return <Select {...props} value={value} onChange={handleChange} />
}

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Team',
    options,
    value: null,
    onChange: () => undefined,
    placeholder: 'Choose a team',
  },
  render: (args) => (
    <div style={storyFrameStyles}>
      <ControlledSelect {...args} />
    </div>
  ),
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof Select>

export const DefaultMd: Story = {
  name: 'Default (md)',
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const Preselected: Story = {
  args: {
    value: 'engineering',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Required: Story = {
  args: {
    required: true,
  },
}

export const WithHelperText: Story = {
  args: {
    helperText: 'Select the team that owns this work.',
  },
}

export const WithError: Story = {
  args: {
    helperText: 'Select the team that owns this work.',
    errorMessage: 'Choose a team to continue.',
  },
}

export const AriaLabelWithoutVisibleLabel: Story = {
  args: {
    label: undefined,
    ariaLabel: 'Team',
  },
}

export const EmptyOptions: Story = {
  args: {
    options: emptyOptions,
  },
}

export const InteractionReview: Story = {
  name: 'Keyboard and pointer review',
  render: (args) => (
    <div style={interactionFrameStyles}>
      <button type="button">Previous focus target</button>
      <ControlledSelect {...args} />
      <button type="button">Next focus target</button>
      <p>
        Keyboard: Enter or Space opens; arrows move without selecting and stop at
        the ends; Enter or Space confirms; Escape cancels; Tab or Shift+Tab
        closes and continues to an adjacent target. Pointer: select an option,
        reopen, then click outside to close without changing it.
      </p>
    </div>
  ),
}

export const ManyOptions = {
  args: {
    label: 'Many options',
    placeholder: 'Choose an option',
    options: manyOptions,
  },
}
