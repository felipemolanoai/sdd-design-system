# Select implementation tasks

## Authority and scope

These tasks implement the approved requirements in `specs/select/spec.md` using
the approved architecture in `specs/select/plan.md`. They divide that work into
reviewable increments; they do not replace or revise either approved document.
If implementation reveals a conflict or requires a decision outside those
documents, stop and return to review instead of changing the contract silently.

## Dependency and parallelization map

| Execution wave | Tasks | Parallelization |
| --- | --- | --- |
| A | 1 and 2 | May run in parallel; they modify separate tooling and component files. |
| B | 3 and 4 | May run in parallel after Task 2; styling and interaction-state work are separate. |
| C | 5, then 6 | Run sequentially after Task 4 because both modify `Select.tsx`. Task 3 may finish alongside them. |
| D | 7 | Starts after Tasks 3, 5, and 6. |
| E | 8 and 9 | May run in parallel after Tasks 1 and 7; stories and tests use separate files. |
| F | 10 | Starts only after Tasks 1–9 are complete. |

Dependencies named below are hard dependencies. A task marked parallelizable is
safe to schedule concurrently only with the specific tasks identified above.

## Task 1 — Set up approved development tooling

**Depends on:** None.

**Parallelizable:** Yes, with Task 2.

Add only the development tooling approved in the plan: the minimal React/Vite
Storybook setup and Vitest with `jsdom`, React Testing Library, and `user-event`.
Select mutually compatible versions for the repository's existing React, Vite,
and TypeScript versions. Add the required scripts, lockfile changes, Storybook
configuration, Vitest configuration, shared test setup, relevant TypeScript
configuration coverage, and README command documentation described in the plan.
Do not add runtime dependencies or optional Storybook/additional accessibility
packages.

### Done when

- `package.json` and `package-lock.json` contain only the approved development
  additions and no new runtime dependency.
- `.storybook/main.ts`, `.storybook/preview.ts`, `vitest.config.ts`, and
  `src/test/setup.ts` load without configuration or TypeScript errors.
- Storybook imports the existing global CSS tokens as required by the plan.
- The documented Storybook and non-watch test commands are available; the test
  command can complete an intentionally empty suite during this setup task.

## Task 2 — Create the Select public API and base structure

**Depends on:** None.

**Parallelizable:** Yes, with Task 1.

Create `src/components/Select/Select.tsx` and
`src/components/Select/index.ts`. Implement the approved controlled public API,
accessible-name type union, base field structure, selected-label/placeholder
display, label, helper/error precedence, required and disabled inputs, default
`md` size, component state attributes, and stable exports. Keep option rendering
internal and keep the approved V1 exclusions out of the API. Document the approved
contract that `options` remain stable while the popup is open; do not add
reconciliation behavior for invalid mid-session changes.

### Done when

- The exported API matches the plan and requires either `label` or `ariaLabel`.
- A controlled value renders its matching option label; `null` renders the
  required placeholder.
- Error content replaces helper content, `md` is the default size, and disabled
  and required inputs reach the rendered structure.
- The barrel exports `Select`, `SelectOption`, `SelectSize`, and `SelectProps`.
- The component type-checks without adding behavior or props outside V1.

## Task 3 — Implement styling and the approved size scale

**Depends on:** Task 2.

**Parallelizable:** Yes, with Task 4.

Create the colocated `Select.css` and connect it to the component. Follow the
approved styling/token section of the plan exactly, including its `sm`, default
`md`, and `lg` measurements and its fixed border, focus-ring, popup-gap, and
popup-height values. Reuse existing global semantic tokens, adding values to
`src/index.css` only when they are genuinely shared. Cover every specified visual
state, the non-color error cue, light/dark themes, local absolute popup, scrolling,
and reduced-motion behavior without introducing a portal or positioning system.

### Done when

- Styles are namespaced under the approved component namespace and use the
  approved state/size attributes and native pseudo-classes.
- The three sizes implement the exact scale recorded in the plan, with `md` as
  the base/default rule.
- Default, hover, focus, open, disabled, selected, and error states are visually
  distinguishable, including without color alone where required.
- The popup matches the trigger width, remains locally positioned, and scrolls
  within the approved maximum height.
- No styling dependency or unrelated starter-app CSS change is introduced.

## Task 4 — Add interaction state and focus foundations

**Depends on:** Task 2.

**Parallelizable:** Yes, with Task 3.

Add the internal open state, active-option index, generated IDs, element refs,
shared open/close/commit helpers, conditional popup and option rendering, and
post-render focus handling specified by the plan. Opening must derive the initial
active option from the controlled selection or first option and must retain
trigger focus for an empty list. Preserve a single source of truth for the selected
value and keep option navigation separate from value commitment.

### Done when

- Opening state and active option are internal while the selected value remains
  fully controlled by the consumer.
- The selected option, first option, and empty-option initial-focus cases are
  represented by the shared interaction helpers.
- `No options available` is rendered as non-interactive content and cannot become
  an active or selected option.
- Generated IDs and refs support later ARIA and keyboard/pointer work without
  collisions or a new shared abstraction.
- Effects and listeners introduced here clean up correctly under `StrictMode`.

## Task 5 — Implement keyboard behavior

**Depends on:** Task 4.

**Parallelizable:** No; complete before Task 6 because both change the component's
event handling.

Implement the keyboard contract from the spec through the interaction helpers in
the plan. Cover Enter and Space opening without double activation, initial option
focus, clamped non-wrapping ArrowUp/ArrowDown movement without selection, Enter
and Space confirmation, Escape cancellation, and trigger-focus restoration for
confirmation and Escape. Implement Tab and Shift+Tab by preserving native focus
movement and closing only when focus leaves, including the approved temporary
trigger tab-order behavior. Keep focus on the trigger when the open list is empty.

### Done when

- Every keyboard path in the spec produces the required open/close, focus, and
  value outcome.
- Arrow navigation never calls `onChange` and never wraps past the first or last
  option.
- Enter/Space selection and Escape return focus to the trigger.
- Tab and Shift+Tab close while focus continues to the appropriate external
  element and never gets forced back to the trigger.
- Keyboard handling is inert when the Select is disabled or has no selectable
  option.

## Task 6 — Implement pointer behavior

**Depends on:** Task 5.

**Parallelizable:** No; it follows Task 5 to avoid concurrent edits to
`Select.tsx` event handling.

Implement trigger toggling, option selection, and open-only outside-pointer
handling through the shared helpers in the plan. Option selection must call the
controlled callback, close, and return focus to the trigger. An outside pointer
must close without changing the value or forcing focus back to the trigger.
Outside-pointer handling must not call `preventDefault()` or otherwise interfere
with the browser's native focus movement. Disabled interaction remains inert.

### Done when

- Pointer activation opens and a second trigger activation closes the popup.
- Clicking an option commits exactly once, closes, and restores trigger focus.
- Clicking outside closes without a value change and without forced trigger focus.
- Inside pointer events are not mistaken for outside events.
- Document-level handling exists only while open and is removed on close/unmount.

## Task 7 — Complete and audit accessibility behavior

**Depends on:** Tasks 3, 5, and 6.

**Parallelizable:** No; this is the integration gate before stories and tests.

Apply and audit the exact accessibility approach approved in the plan across the
completed structure and interactions. Verify accessible naming, button-trigger
and listbox/option semantics, expanded/controls/selected state, generated ID
relationships, disabled and required communication, live helper/error
descriptions, invalid state, visible focus, non-color error communication, and
the empty-list experience. Resolve accessibility defects within the approved
architecture; do not substitute a different widget pattern or add a dependency.

### Done when

- A visible `label` or required `ariaLabel` gives every instance an accessible
  name and the displayed value or placeholder remains exposed.
- Trigger, listbox, and options expose all relationships and states named in the
  plan, with unique IDs across multiple instances.
- Helper and error descriptions never coexist incorrectly or reference unmounted
  content, and error/required/disabled states are communicated accessibly.
- Visible focus and all focus transitions match the spec for keyboard, pointer,
  empty-list, and outside-close paths.
- The integrated component remains within the approved custom React/DOM pattern.

## Task 8 — Add Storybook stories

**Depends on:** Tasks 1 and 7.

**Parallelizable:** Yes, with Task 9.

Create `src/components/Select/Select.stories.tsx` using the Storybook setup from
Task 1. Implement the complete story matrix listed in the plan with a controlled
wrapper, including the approved size scale and state/content variants. Add concise
keyboard verification instructions or supported story interactions without
introducing optional addons or changing component behavior for Storybook.

### Done when

- Stories cover default `md`, `sm`, `lg`, preselected, disabled, required, helper,
  error, `ariaLabel` without visible label, and empty-options cases.
- Controlled stories update the displayed selection through the public API.
- Reviewers can exercise the full keyboard and pointer flows described by the
  approved documents.
- Storybook renders with the same global tokens, light/dark behavior, and no
  component-specific runtime dependency.

## Task 9 — Add automated tests

**Depends on:** Tasks 1 and 7.

**Parallelizable:** Yes, with Task 8.

Create `src/components/Select/Select.test.tsx` using the approved test stack and a
controlled harness. Translate the testing matrix in the plan and all acceptance
criteria in the spec into observable interaction and accessibility tests. Test
public behavior rather than internal implementation details, and do not add
coverage for out-of-scope or invalid V1 usage such as changing `options` while
open.

### Done when

- Tests cover public rendering, all keyboard and pointer paths, focus outcomes,
  disabled/required/error behavior, empty options, size selection, and multiple
  instance IDs described in the plan.
- Assertions verify the approved ARIA roles, states, names, and description
  relationships.
- Navigation tests prove arrows do not commit or wrap, and Tab/Shift+Tab and
  outside clicks do not restore trigger focus incorrectly.
- The suite maps back to every acceptance criterion in the spec and passes without
  snapshots that obscure behavioral intent.

## Task 10 — Run final validation and scope review

**Depends on:** Tasks 1–9.

**Parallelizable:** No.

Run automated validation from the plan: lint, non-watch automated tests, the
production app build, and the static Storybook build. Separately, run manual
validation through the Storybook stories: keyboard interaction, pointer
interaction, light/dark visual review, and the planned screen-reader smoke test.
Compare the result against the approved spec and plan, inspect the dependency and
file diff for scope creep, and correct only defects within the approved
implementation.

### Done when

- Automated validation passes: lint, tests, application build, and static
  Storybook build.
- Manual validation passes: keyboard, pointer, light/dark visual review, and
  screen-reader smoke testing across the story matrix.
- Every spec acceptance criterion is accounted for by automated or explicitly
  recorded manual validation.
- The dependency diff contains only the approved development tooling and no new
  runtime package.
- The file diff matches the plan's expected files, leaves `src/App.tsx` and
  `src/App.css` unchanged, and contains no unapproved feature or architectural
  change.
