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

The Select may receive and display an error message.

When an error is present:

- the component must expose an error state visually
- the error message must be associated with the Select
- the error must remain understandable without relying only on color
- the error message replaces helper text while the error is present

## Required behavior

The Select may be marked as required.

The Select does not perform form validation by itself.

The consuming form or application determines when the field is invalid
and provides the corresponding error state.

When required:

- the required state must be communicated to the user
- an empty value may be considered invalid by the consuming form


## Keyboard behavior

When focused and closed:

- Enter opens the Select
- Space opens the Select

When the Select opens:

- if a value is already selected, focus starts on the selected option
- if no value is selected and options are available, focus starts on the first available option
- if no options are available, focus remains on the Select trigger

When open:

- ArrowDown moves focus to the next option
- ArrowUp moves focus to the previous option
- Arrow navigation does not change the selected value
- ArrowDown on the last option keeps focus on the last option
- ArrowUp on the first option keeps focus on the first option
- Enter selects the focused option and closes the Select
- Space selects the focused option and closes the Select
- Escape closes the Select without changing the selected value
- Tab closes the Select and moves focus normally to the next focusable element
- Shift+Tab closes the Select and moves focus normally to the previous focusable element

After closing:

- after selection with Enter or Space, focus returns to the Select trigger
- after closing with Escape, focus returns to the Select trigger
- after Tab or Shift+Tab, focus continues naturally to the next or previous focusable element

## Pointer behavior

When open:

- clicking an option selects it and closes the Select
- after selecting an option with pointer, focus returns to the Select trigger
- clicking outside the Select closes it without changing the selected value
- clicking the trigger again closes the Select

Closing through an outside click must not force focus back to the trigger.

## Empty selection

The Select may initially have no selected value.

When no value is selected:

- a placeholder must be provided
- the placeholder is displayed
- the placeholder must not be treated as a selectable value

## Options

Each option must have:

- a visible label
- a unique value

Disabled options are out of scope for the first version.

## Empty options

The Select may receive an empty list of options.

When no options are available:

- the Select may still be opened
- the list displays "No options available"
- no value can be selected
- keyboard focus remains on the Select trigger

## Accessibility

The Select must:
- have an accessible name, either through a visible label or an equivalent accessible naming mechanism
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
9. After selection with Enter, Space, or pointer, focus returns to the Select trigger.
10. The Select supports `sm`, `md`, and `lg`.
11. `md` is used when no size is specified.
12. An empty Select displays its placeholder.
13. Error state is not communicated using color alone.
14. Keyboard-only users can complete the entire selection flow.
15. When opened with an existing selection, focus starts on the selected option.
16. When opened without a selection and options are available, focus starts on the first available option.
17. Arrow navigation does not change the selected value until the user confirms a selection.
18. Arrow navigation does not wrap between the first and last options.
19. Tab and Shift+Tab close the Select while preserving normal focus navigation.
20. Clicking outside closes the Select without changing the selected value.
21. A Select with no options displays "No options available".
22. Every Select has an accessible name, even when no visible label is present.
23. The consuming application controls validation and provides the error state.
24. An error message replaces helper text while the error is present.
25. Enter opens the Select when it is focused and closed.
26. Space opens the Select when it is focused and closed.
27. If no options are available, opening the Select keeps focus on the trigger.
28. Tab and Shift+Tab do not return focus to the trigger after closing.
29. Clicking outside closes the Select without forcing focus back to the trigger.