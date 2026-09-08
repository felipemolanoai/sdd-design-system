# Select

## Objective

Provide a reusable Select component that allows users
to choose one option from a predefined list of options.

## Core behavior

The Select must:

- allow the user to open a list of available options
- allow the user to select one option
- display the currently selected option
- allow selection using mouse or keyboard
- close after an option is selected

## Supported content

The Select must support:

- label
- placeholder
- helper text
- error message

## States

The Select must support:

- default
- hover
- focus
- open
- disabled
- error

## Sizes

The Select must support:

- sm
- md
- lg

The default size is `md`.

## Disabled behavior

When disabled:

- the Select cannot be opened
- the value cannot be changed
- the component remains perceivable as disabled

## Error behavior

The Select may display an error message.

When an error is present:

- the component must expose an error state visually
- the error message must be associated with the Select
- the error must remain understandable without relying only on color

## Keyboard behavior

When focused:

- Enter or Space opens the Select

When open:

- ArrowDown moves to the next option
- ArrowUp moves to the previous option
- Enter selects the focused option
- Escape closes the Select without changing the current value

After closing:

- focus returns to the Select trigger

## Required behavior

The Select may be marked as required.

When required:

- the required state must be communicated to the user
- an empty value is considered invalid when validation occurs

## Empty selection

The Select may initially have no selected value.

When no value is selected:

- the placeholder is displayed
- the placeholder must not be treated as a selectable value

## Options

Each option must have:

- a visible label
- a unique value

Disabled options are out of scope for the first version.

## Accessibility

The Select must:

- be fully operable with keyboard
- expose an accessible name
- communicate disabled state
- communicate required state
- communicate error state
- maintain visible focus
- provide correct focus behavior when opening and closing

## Out of scope

The first version does not support:

- multiple selection
- searchable options
- async option loading
- grouped options
- disabled individual options
- custom option rendering

## Acceptance criteria

1. A user can open the Select using mouse or keyboard.
2. A user can select one available option.
3. The selected option is displayed after selection.
4. The Select closes after a successful selection.
5. A disabled Select cannot be opened.
6. ArrowDown and ArrowUp navigate through available options.
7. Enter selects the currently focused option.
8. Escape closes the Select without changing the selected value.
9. Focus returns to the trigger after the Select closes.
10. The Select supports `sm`, `md`, and `lg`.
11. `md` is used when no size is specified.
12. An empty Select displays its placeholder.
13. Error state is not communicated using color alone.
14. Keyboard-only users can complete the entire selection flow.